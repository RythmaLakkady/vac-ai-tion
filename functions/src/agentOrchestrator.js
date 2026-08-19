/**
 * agentOrchestrator.js
 *
 * Multi-Agent Travel Orchestrator (Swarm AI)
 */
const admin = require("firebase-admin");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ── Helper: call Groq API ────────────────────────────────
async function callGroq(apiKey, systemPrompt, userPrompt, maxTokens = 6000, jsonMode = false) {
  let currentMaxTokens = maxTokens;
  let maxCallRetries = 6;
  
  for (let i = 0; i < maxCallRetries; i++) {
    const body = {
      model: "openai/gpt-oss-120b",
      max_tokens: currentMaxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    };

    if (jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Groq API attempt ${i+1} failed with ${res.status}: ${errText}`);

      if (res.status === 429) {
        // Rate limit hit (RPM or TPM). Wait 10 seconds before retrying.
        await new Promise(resolve => setTimeout(resolve, 10000));
        continue;
      }
      
      // Auto-adjust max_tokens if we hit the 8000 TPM limit or payload too large
      if (res.status === 413 || errText.includes("rate_limit_exceeded")) {
        const match = errText.match(/Requested (\d+)/);
        if (match && match[1]) {
          const requested = parseInt(match[1]);
          const overshoot = requested - 8000;
          if (overshoot > 0 && currentMaxTokens > overshoot + 500) {
             currentMaxTokens = currentMaxTokens - overshoot - 500; // Add 500 buffer
          } else {
             currentMaxTokens = Math.max(1000, currentMaxTokens - 1500);
          }
        } else {
          currentMaxTokens = Math.max(1000, currentMaxTokens - 1500);
        }
        // Wait 10 seconds to allow TPM bucket to drain
        await new Promise(resolve => setTimeout(resolve, 10000));
        continue;
      }
      
      throw new Error(`Groq API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  }
  throw new Error("Groq API error: Max rate limit retries reached.");
}

// ── Helper: append log to Firestore job doc ──────────────
async function appendLog(jobId, agent, message) {
  const db = admin.firestore();
  await db
    .collection("agentJobs")
    .doc(jobId)
    .update({
      logs: admin.firestore.FieldValue.arrayUnion({
        agent,
        message,
        timestamp: Date.now(),
      }),
    });
}

// ── Helper: update job status ────────────────────────────
async function updateJobStatus(jobId, status, extra = {}) {
  const db = admin.firestore();
  await db
    .collection("agentJobs")
    .doc(jobId)
    .update({ status, ...extra });
}

// ── The Manager Strategy Prompt ──────────────────────────
function buildManagerPrompt(params) {
  const notesSection = params.savedNotes && params.savedNotes.length > 0
    ? `\n\nThe user specifically requested to visit these places: [${params.savedNotes.join(', ')}]. You MUST include these in your strategy.\n`
    : "";

  const foodSection = params.foodPreferences && params.foodPreferences !== 'No Restrictions'
    ? `\n\nDietary preference: "${params.foodPreferences}". You MUST ensure dining recommendations cater to this diet.\n`
    : "";

  return `You are the Swarm Manager for a travel planning AI. Your job is to draft a high-level strategy for a ${params.days}-day trip from ${params.startLocation || 'their origin'} to ${params.destination}.
User Constraints:
- Origin: ${params.startLocation || 'Unknown'}
- Budget: ${params.budget}
- Travelers: ${params.travelers}
- Travel Style: ${params.travelStyle}${notesSection}${foodSection}

Instructions:
Provide a plain-text, day-by-day outline. For each of the ${params.days} days, provide a "Theme" and 2-3 key activities or locations.
Day 1 MUST be an Arrival Day. The final day MUST be a Departure Day.
CRITICAL - HIDDEN GEMS: You MUST include at least one "hidden gem" or off-the-beaten-path spot loved by locals in every single day.
CRITICAL - SMART LOGISTICS: You MUST geographically group each day's activities together to minimize transit time.
CRITICAL - SERVICES: Do NOT recommend hiring private chauffeurs or private transfer services. Recommend local transit, booking apps (like Uber/Grab), and hotels.
Do NOT output JSON. Just a clear, concise text strategy that a Planner agent can follow.`;
}

// ── The itinerary JSON schema prompt ─────────────────────
function buildPlannerPrompt(params, feedback, managerStrategy) {
  const feedbackSection = feedback
    ? `\n\nIMPORTANT: Your previous attempt was REJECTED by the Critic Agent for the following reason:\n"${feedback}"\nPlease fix the issues and try again.\n`
    : "";

  const notesSection = params.savedNotes && params.savedNotes.length > 0
    ? `\n\nCRITICAL REQUIREMENT - USER'S SAVED NOTES:\nThe user specifically requested to visit these places: [${params.savedNotes.join(', ')}]. \nThese places have been pre-filtered and are confirmed to be in ${params.destination}. You ABSOLUTELY MUST include ALL of these places in the itinerary, dedicating activities to them, and set "is_saved_note": true for these specific activities. Failure to include them is unacceptable.\n`
    : "";

  const foodSection = params.foodPreferences && params.foodPreferences !== 'No Restrictions'
    ? `\n\nCRITICAL REQUIREMENT - DIETARY PREFERENCES:\nThe user has specified a strict dietary preference: "${params.foodPreferences}". You MUST ensure that the activities include restaurant and dining recommendations (at least 1 per day) that explicitly cater to this diet. State how they accommodate it in the 'place_details' field.\n`
    : "";

  const healthSection = params.healthInfo
    ? `\n\nCRITICAL REQUIREMENT - HEALTH & ACCESSIBILITY:\nThe user has specified the following health/allergy/accessibility needs: "${params.healthInfo}". You MUST prioritize accommodations and activities that fit these needs. For any hotel or activity that specifically accommodates these needs, you MUST provide a short explanation in the 'customization_banner' field (e.g., 'Gluten-Free Menu Available', 'Wheelchair Accessible'). If no special accommodation is needed or available, leave it empty.\n`
    : "";

  const seasonSection = params.season && params.season !== 'Not specified'
    ? `\n\nCRITICAL REQUIREMENT - TRAVEL SEASON:\nThe user prefers to travel during: "${params.season}". You MUST tailor the itinerary, weather tips, and 'season_recommendations' specifically around this time frame. Ensure activities make sense for this season.\n`
    : "";

  return `You are a strict data-formatter Planner Agent. A Manager Agent has already drafted the strategy for this trip. 
Here is the Manager's Strategy:
-------------------
${managerStrategy}
-------------------

Your job is to take the Manager's Strategy and format it EXACTLY into the required JSON structure.
Generate a ${params.days}-day travel itinerary for ${params.travelers} traveling from ${params.startLocation || 'their origin'} to ${params.destination}, with a budget of ${params.budget} and a travel style of ${params.travelStyle}. You MUST generate EXACTLY ${params.days} days in the itinerary array. No fewer and no more.${notesSection}${foodSection}${healthSection}${seasonSection}${feedbackSection}

IMPORTANT RULES:
1. The first day MUST be designated as the "Arrival Day" (theme should reflect arrival/check-in/light exploration) and the final day MUST be designated as the "Departure Day" (theme should reflect departure/packing/final sightseeing).
2. HIDDEN GEMS: You MUST include at least one "hidden gem" or off-the-beaten-path spot loved by locals in every single day.
3. SMART LOGISTICS: You MUST geographically group each day's activities together to minimize transit time. Optimize the route!
4. TRANSPORT & SERVICES: Do NOT recommend hiring private chauffeurs, drivers, or luxury transfer services. We do not provide those. Instead, explicitly recommend booking apps (like Uber, Grab, booking.com) and local transit apps in the 'wanderer_notes' and activity descriptions.
5. FLIGHTS: You MUST generate flight options departing ONLY from ${params.startLocation || 'their origin'}. Do NOT assume the user is flying from anywhere else.
6. DEPARTURE: The very LAST activity on the final day MUST explicitly be "Head to the Airport" or "Departure", including advice on when to leave for the airport.

You MUST return your response as a valid JSON object matching this exact structure:
{
  "flight_options": [
    {
      "airline": "String",
      "estimated_price": "String",
      "duration": "String",
      "booking_url": "String (Real URL to book flights like Skyscanner or Google Flights)",
      "description": "String (Explain why this flight option departing from ${params.startLocation || 'their origin'} is good)"
    }
  ],
  "hotel_options": [
    {
      "hotel_name": "String",
      "address": "String",
      "price": "String (e.g., $150/night - include details on what this price covers)",
      "rating": "String or Number",
      "geo_coordinates": { "latitude": Number, "longitude": Number },
      "booking_url": "String (A real URL to book this hotel or their official website)",
      "description": "String (Explain why you suggest this hotel and what vibe it offers)",
      "customization_banner": "String (Explain how it accommodates the user's health needs, if applicable)"
    }
  ],
  "wanderer_notes": {
    "getting_around": "String (Best way to commute, apps to use like Uber, Grab, local transit, etc.)",
    "weather_clothing_tips": "String (What to pack and expect)",
    "cultural_etiquette": "String (Important local customs or tips)",
    "tourist_tips": ["String (Practical tips from other tourists)"],
    "recommended_apps": [
      {
        "name": "String",
        "purpose": "String"
      }
    ],
    "native_food_options": [
      {
        "name": "String",
        "description": "String",
        "where_to_find": "String"
      }
    ],
    "season_recommendations": "String (Best/cheapest months to visit, weather notes, and crowd levels. Tailor this to their preferred season if they specified one)"
  },
  "itinerary": [
    {
      "day": Number,
      "theme": "String",
      "best_time": "String",
      "daily_brief": "String (A conversational, tour-guide style brief outlining the morning flow, how to avoid traffic, breakfast tips, etc. Make it engaging!)",
      "activities": [
        {
          "place_name": "String",
          "place_details": "String (A short description of what it is, why it's famous, and why they should do it)",
          "importance": "String (A brief description of its historical, cultural, or local significance)",
          "rating": "String or Number",
          "ticket_pricing": "String",
          "time_travel": "String",
          "booking_url": "String (A real URL for booking tickets or the official website)",
          "read_more_url": "String (A real URL to a Wikipedia or official tourism page to read more)",
          "geo_coordinates": { "latitude": Number, "longitude": Number },
          "is_saved_note": "Boolean (true if this place was from the user's saved notes, false otherwise)",
          "is_hidden_gem": "Boolean (true if this place is a hidden gem/local favorite, false otherwise)",
          "customization_banner": "String (Explain how it accommodates the user's health needs, if applicable)"
        }
      ]
    }
  ]
}

Provide 3-5 hotel options. For the itinerary, you ABSOLUTELY MUST provide an array containing EXACTLY ${params.days} day objects. DO NOT provide 3 days if asked for 10. Generate exactly ${params.days}. Provide 2-3 activities per day. Write engaging descriptions, but keep them under 3 sentences to keep the JSON manageable. Ensure all image URLs and booking URLs are real and working. Return ONLY the raw JSON object, without any markdown formatting, backticks, or introductory text.`;
}

function buildCriticPrompt(itineraryJson, params) {
  const foodRule = params.foodPreferences && params.foodPreferences !== 'No Restrictions'
    ? `\n8. Must include dining options that accommodate a ${params.foodPreferences} diet.`
    : "";

  return `You are a strict travel itinerary critic. Evaluate the following itinerary JSON against these constraints:

USER CONSTRAINTS:
- Origin: ${params.startLocation || 'Unknown'}
- Destination: ${params.destination}
- Duration: ${params.days} days
- Budget tier: ${params.budget}
- Travelers: ${params.travelers}
- Travel Style: ${params.travelStyle}
- Food Preference: ${params.foodPreferences || 'None'}

ITINERARY TO EVALUATE:
${itineraryJson}

VALIDATION RULES:
1. The itinerary must have exactly ${params.days} days
2. Each day must have 2-3 activities
3. There must be 3-5 hotel options
4. If budget is "Low-Cost", no hotel should exceed $100/night
5. If budget is "Luxury", hotels should be premium (4+ star rating)
6. Activities should be appropriate for ${params.travelers}
7. The JSON must be valid and complete${foodRule}

Respond with EXACTLY one of these formats:
- If the itinerary passes: "PASS"
- If the itinerary fails: "FAIL: [brief reason describing what's wrong]"

Respond with ONLY "PASS" or "FAIL: [reason]". No other text.`;
}

// ── Main orchestrator ────────────────────────────────────
async function runAgentOrchestrator(jobId, params, apiKey) {
  const MAX_RETRIES = 3;
  let attempt = 0;
  let criticFeedback;
  let finalItinerary = null;

  try {
    // ── Phase 1: Vibe Matcher ──────────────────────────
    await updateJobStatus(jobId, "processing");
    await appendLog(jobId, "vibe-matcher", `🎯 Analyzing travel vibe for "${params.destination}"...`);
    await appendLog(
      jobId,
      "vibe-matcher",
      `📊 Profile: ${params.days} days · ${params.budget} · ${params.travelers} · ${params.travelStyle}`
    );
    await appendLog(jobId, "vibe-matcher", "✅ Vibe analysis complete. Handing off to Manager Agent.");

    // ── Phase 1.5: Manager ──────────────────────────
    await appendLog(jobId, "manager", `🧠 Drafting day-by-day strategy for ${params.days} days...`);
    let managerStrategy;
    try {
      managerStrategy = await callGroq(
        apiKey,
        "You are the Swarm Manager. You strategize vacations.",
        buildManagerPrompt(params),
        4000,
        false
      );
      await appendLog(jobId, "manager", "✅ Strategy drafted. Handing off to Planner Agent.");
    } catch (err) {
      await appendLog(jobId, "manager", `❌ Manager API error: ${err.message}`);
      throw err;
    }

    // ── Phase 2: Planner ↔ Critic loop ─────────────────
    while (attempt < MAX_RETRIES) {
      attempt++;
      await appendLog(
        jobId,
        "planner",
        `🗺️ ${attempt > 1 ? `Re-generating (attempt ${attempt}/${MAX_RETRIES})...` : "Generating itinerary..."}`
      );

      // Call Planner
      const plannerPrompt = buildPlannerPrompt(params, criticFeedback, managerStrategy);
      let rawItinerary;
      try {
        rawItinerary = await callGroq(
          apiKey,
          "You are a travel planning assistant that generates detailed travel itineraries in JSON format.",
          plannerPrompt,
          6000,
          true
        );
      } catch (err) {
        await appendLog(jobId, "planner", `❌ Planner API error: ${err.message}`);
        throw err;
      }

      // Robust JSON extraction
      let jsonString = rawItinerary;
      const startIdx = rawItinerary.indexOf('{');
      const endIdx = rawItinerary.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
        jsonString = rawItinerary.substring(startIdx, endIdx + 1);
      }

      // Parse JSON
      let parsedItinerary;
      try {
        parsedItinerary = JSON.parse(jsonString);
      } catch (err) {
        console.error("Failed to parse JSON:", err);
        await appendLog(jobId, "planner", "⚠️ Invalid JSON output, retrying...");
        criticFeedback = "The output was not valid JSON. Please return only a valid JSON object.";
        continue;
      }

      await appendLog(jobId, "planner", "✅ Itinerary generated. Sending to Critic Agent for review...");

      // Call Critic
      await appendLog(jobId, "critic", "🔍 Evaluating itinerary against user constraints...");
      let criticResponse;
      try {
        criticResponse = await callGroq(
          apiKey,
          "You are a strict travel itinerary quality assurance agent.",
          buildCriticPrompt(jsonString, params),
          150
        );
      } catch (err) {
        await appendLog(jobId, "critic", `⚠️ Critic unavailable, accepting current itinerary.`);
        finalItinerary = parsedItinerary;
        break;
      }

      const trimmed = criticResponse.trim();
      if (trimmed.startsWith("PASS")) {
        await appendLog(jobId, "critic", "✅ Itinerary APPROVED! All constraints satisfied.");
        finalItinerary = parsedItinerary;
        break;
      } else if (trimmed.startsWith("FAIL")) {
        criticFeedback = trimmed.replace("FAIL:", "").trim();
        await appendLog(jobId, "critic", `❌ REJECTED: ${criticFeedback}`);
        if (attempt >= MAX_RETRIES) {
          await appendLog(
            jobId,
            "critic",
            "⚠️ Max retries reached. Accepting last itinerary despite issues."
          );
          finalItinerary = parsedItinerary;
        }
      } else {
        // Unexpected critic response — accept the itinerary
        await appendLog(jobId, "critic", "✅ Critic returned non-standard response. Accepting itinerary.");
        finalItinerary = parsedItinerary;
        break;
      }
    }

    if (!finalItinerary) {
      throw new Error("Failed to generate a valid itinerary after all attempts.");
    }

    // ── Phase 3: Save results ──────────────────────────
    await appendLog(jobId, "system", "💾 Saving trip to your account...");

    const db = admin.firestore();
    const tripDocId = Date.now().toString();
    await db.collection("UserTrips").doc(tripDocId).set({
      userEmail: params.userEmail,
      userSelection: {
        destination: params.destination,
        days: String(params.days),
        budget: params.budget,
        travelers: params.travelers,
        travelStyle: params.travelStyle || "",
        foodPreferences: params.foodPreferences || "",
      },
      tripData: finalItinerary,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      generatedBy: "multi-agent-orchestrator",
      agentJobId: jobId,
      attempts: attempt,
    });

    await updateJobStatus(jobId, "completed", {
      tripDocId,
      tripData: finalItinerary,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      attempts: attempt,
    });

    await appendLog(jobId, "system", `🎉 Trip ready! Redirecting you now...`);
  } catch (err) {
    console.error("Agent orchestrator error:", err);
    await appendLog(jobId, "system", `❌ Error: ${err.message}`);
    await updateJobStatus(jobId, "failed", {
      error: err.message,
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

module.exports = {
  runAgentOrchestrator
};
