/**
 * agentOrchestrator.js
 *
 * Multi-Agent Travel Orchestrator (Swarm AI)
 */
const admin = require("firebase-admin");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ── Helper: call Groq API ────────────────────────────────
async function callGroq(apiKey, systemPrompt, userPrompt, maxTokens = 2500, jsonMode = false) {
  const body = {
    model: "llama-3.3-70b-versatile",
    max_tokens: maxTokens,
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
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
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

// ── The itinerary JSON schema prompt ─────────────────────
function buildPlannerPrompt(params, feedback) {
  const feedbackSection = feedback
    ? `\n\nIMPORTANT: Your previous attempt was REJECTED by the Critic Agent for the following reason:\n"${feedback}"\nPlease fix the issues and try again.\n`
    : "";

  return `Generate a ${params.days}-day travel itinerary for ${params.travelers} traveling to ${params.destination}, with a budget of ${params.budget}.${feedbackSection}

IMPORTANT: The first day MUST be designated as the "Arrival Day" (theme should reflect arrival/check-in/light exploration) and the final day MUST be designated as the "Departure Day" (theme should reflect departure/packing/final sightseeing).

You MUST return your response as a valid JSON object matching this exact structure:
{
  "hotel_options": [
    {
      "hotel_name": "String",
      "address": "String",
      "price": "String (e.g., $150/night)",
      "rating": "String or Number",
      "image_url": "String (Valid Image URL)",
      "geo_coordinates": { "latitude": Number, "longitude": Number },
      "description": "String"
    }
  ],
  "itinerary": [
    {
      "day": Number,
      "theme": "String",
      "best_time": "String",
      "activities": [
        {
          "place_name": "String",
          "place_details": "String",
          "image_url": "String (Valid Image URL)",
          "rating": "String or Number",
          "ticket_pricing": "String",
          "time_travel": "String",
          "geo_coordinates": { "latitude": Number, "longitude": Number }
        }
      ]
    }
  ]
}

Provide 3-5 hotel options. For the itinerary, provide exactly ${params.days} days, and 2-3 activities per day. Keep all descriptions extremely concise (max 1 sentence) to avoid large responses. Ensure all image URLs are real, working URLs. Return ONLY the raw JSON object, without any markdown formatting, backticks, or introductory text.`;
}

function buildCriticPrompt(itineraryJson, params) {
  return `You are a strict travel itinerary critic. Evaluate the following itinerary JSON against these constraints:

USER CONSTRAINTS:
- Destination: ${params.destination}
- Duration: ${params.days} days
- Budget tier: ${params.budget}
- Travelers: ${params.travelers}

ITINERARY TO EVALUATE:
${itineraryJson}

VALIDATION RULES:
1. The itinerary must have exactly ${params.days} days
2. Each day must have 2-3 activities
3. There must be 3-5 hotel options
4. If budget is "Low-Cost", no hotel should exceed $100/night
5. If budget is "Luxury", hotels should be premium (4+ star rating)
6. Activities should be appropriate for ${params.travelers}
7. The JSON must be valid and complete

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
      `📊 Profile: ${params.days} days · ${params.budget} · ${params.travelers}`
    );
    await appendLog(jobId, "vibe-matcher", "✅ Vibe analysis complete. Handing off to Planner Agent.");

    // ── Phase 2: Planner ↔ Critic loop ─────────────────
    while (attempt < MAX_RETRIES) {
      attempt++;
      await appendLog(
        jobId,
        "planner",
        `🗺️ ${attempt > 1 ? `Re-generating (attempt ${attempt}/${MAX_RETRIES})...` : "Generating itinerary..."}`
      );

      // Call Planner
      const plannerPrompt = buildPlannerPrompt(params, criticFeedback);
      let rawItinerary;
      try {
        rawItinerary = await callGroq(
          apiKey,
          "You are a travel planning assistant that generates detailed travel itineraries in JSON format.",
          plannerPrompt,
          2500,
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
