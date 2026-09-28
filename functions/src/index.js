const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { rankVendorResults } = require("./rankVendorResults");
const { createQueryHash, getCachedItinerary, cacheItinerary } = require("./cacheUtils");
const { runAgentOrchestrator } = require("./agentOrchestrator");

const path = require("path");
const fs = require("fs");

let serviceAccount = null;
const keyPath = path.join(__dirname, "../..", "wandergen---ai-travel-planner-firebase-adminsdk-fbsvc-24b2108884.json");

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (e) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var");
  }
} else if (fs.existsSync(keyPath)) {
  serviceAccount = require(keyPath);
}

if (!admin.apps.length) {
  try {
    if (serviceAccount) {
      console.log("Initializing Firebase Admin with service account credentials...");
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp();
    }
  } catch (error) {
    console.log("Firebase Admin initialization failed.", error);
  }
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Rate Limiting Middleware
const rateLimit = async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const db = admin.firestore();
  const ref = db.collection("rateLimits").doc(ip.replace(/:/g, '_'));
  
  try {
    const doc = await ref.get();
    const now = Date.now();
    if (doc.exists) {
      const data = doc.data();
      if (now - data.timestamp < 60000 && data.count >= 10) {
        return res.status(429).json({ error: "Too many requests. Please try again later." });
      }
      if (now - data.timestamp > 60000) {
        await ref.set({ count: 1, timestamp: now });
      } else {
        await ref.update({ count: admin.firestore.FieldValue.increment(1) });
      }
    } else {
      await ref.set({ count: 1, timestamp: now });
    }
    next();
  } catch (err) {
    next(); // fail open
  }
};
app.use(rateLimit);

// ── Mock vendor fetcher ──────────────────────────────────
async function fetchVendorPrices(destination, _dates) {
  const base = destination.length * 12;
  return [
    { type: "Flight", vendor: "SkyScanner", price: base + 120, currency: "USD", link: "https://skyscanner.com", rating: 4.2, refundable: true, co2Kg: 95 },
    { type: "Flight", vendor: "Google Flights", price: base + 95, currency: "USD", link: "https://flights.google.com", rating: 4.5, refundable: false, co2Kg: 90 },
    { type: "Flight", vendor: "Expedia (Flights)", price: base + 130, currency: "USD", link: "https://expedia.com", rating: 3.8, refundable: false, co2Kg: 105 },
    { type: "Hotel", vendor: "Booking.com", price: base + 150, currency: "USD", link: "https://booking.com", rating: 4.0, refundable: true, co2Kg: 110 },
    { type: "Hotel", vendor: "Airbnb", price: base + 110, currency: "USD", link: "https://airbnb.com", rating: 4.7, refundable: false, co2Kg: 50 },
    { type: "Hotel", vendor: "Hotels.com", price: base + 140, currency: "USD", link: "https://hotels.com", rating: 4.1, refundable: true, co2Kg: 90 },
    { type: "Ticket", vendor: "Viator", price: base + 45, currency: "USD", link: "https://viator.com", rating: 4.6, refundable: true, co2Kg: 5 },
    { type: "Ticket", vendor: "GetYourGuide", price: base + 40, currency: "USD", link: "https://getyourguide.com", rating: 4.8, refundable: true, co2Kg: 4 },
  ];
}

// ── POST /compare ────────────────────────────────────────
app.post("/compare", async (req, res) => {
  const { destination, dates, preferences } = req.body;
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!destination || !dates) {
    return res.status(400).json({ error: "destination and dates are required" });
  }

  try {
    let results = await fetchVendorPrices(destination, dates);

    if (preferences?.budget) {
      const userPrefs = {
        budget: preferences.budget || "Affordable Comfort",
        prefersRefundable: preferences.prefersRefundable ?? false,
        ecoConscious: preferences.ecoConscious ?? false,
      };
      results = rankVendorResults(results, userPrefs);
    }

    let insights = "";
    if (groqApiKey) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: [{
              role: "system",
              content: `You are a travel pricing expert. Give a brief, 3-sentence insight for traveling to ${destination}. Mention predicting lower price seasons, a quick hidden gem, and any tips for getting cheaper tickets or hotels.`
            }]
          })
        });
        const groqData = await groqRes.json();
        if (groqData?.choices?.[0]?.message?.content) {
          insights = groqData.choices[0].message.content;
        }
      } catch (err) {
        console.error("LLM Insight fetch failed:", err);
      }
    }

    const db = admin.firestore();
    await db.collection("priceSearches").add({
      destination,
      dates,
      results,
      userId: preferences?.userId || "anonymous",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ results, insights, cached: false });
  } catch (err) {
    console.error("Price fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /create-job ─────────────────────────────────────
app.post("/create-job", async (req, res) => {
  const { startLocation, destination, days, budget, travelers, travelStyle, savedNotes, userId, userEmail, prebookedFlights, prebookedHotels } = req.body;
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!destination || !days || !budget || !travelers) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const queryHash = createQueryHash({ startLocation, destination, days: Number(days), budget, travelers, travelStyle });
    const cached = await getCachedItinerary(queryHash);

    if (cached) {
      const db = admin.firestore();
      const jobId = `cached-${Date.now()}`;
      await db.collection("agentJobs").doc(jobId).set({
        status: "completed",
        tripDocId: cached.jobId,
        tripData: cached.tripData,
        queryHash,
        params: { startLocation, destination, days, budget, travelers, travelStyle, savedNotes, userId, userEmail, prebookedFlights, prebookedHotels },
        logs: [
          { agent: "system", message: "⚡ Cache hit! Returning previously generated itinerary.", timestamp: Date.now() },
          { agent: "system", message: "🎉 Trip ready! Redirecting you now...", timestamp: Date.now() },
        ],
        cached: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(200).json({ jobId, cached: true });
    }

    const db = admin.firestore();
    const jobRef = db.collection("agentJobs").doc();
    const jobId = jobRef.id;

    await jobRef.set({
      status: "pending",
      queryHash,
      params: { startLocation, destination, days: Number(days), budget, travelers, travelStyle, savedNotes, userId: userId || "anonymous", userEmail: userEmail || "anonymous", prebookedFlights, prebookedHotels },
      logs: [{ agent: "system", message: "🚀 Job created. Initializing agent swarm...", timestamp: Date.now() }],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    runAgentOrchestrator(jobId, { startLocation, destination, days: Number(days), budget, travelers, travelStyle, savedNotes, userId, userEmail, prebookedFlights, prebookedHotels }, groqApiKey)
      .then(async () => {
        const updatedSnap = await jobRef.get();
        const updatedData = updatedSnap.data();
        if (updatedData?.status === "completed" && updatedData?.tripData) {
          await cacheItinerary(queryHash, updatedData.tripData, jobId);
        }
      })
      .catch((err) => console.error("Background orchestrator error:", err));

    res.status(202).json({ jobId, cached: false });
  } catch (err) {
    console.error("Job creation error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /chat ───────────────────────────────────────────
app.post("/chat", async (req, res) => {
  const { prompt } = req.body;
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) return res.status(500).json({ error: "Missing API Key on Server" });
  
  try {
    const systemPrompt = `You are an elite travel AI assistant for 'vac-ai-tion'. You MUST output a fully valid JSON object when requested, without any syntax errors. Double-check all closing brackets and braces. Do NOT include any markdown formatting, conversational text, or trailing commas if asked for strict JSON.`;
    
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        max_tokens: 3500,
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]
      })
    });
    const groqData = await groqRes.json();
    if (groqData?.choices?.[0]?.message?.content) {
      res.json({ text: groqData.choices[0].message.content });
    } else {
      res.status(500).json({ error: "No response from AI" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /autocomplete ────────────────────────────────────
app.get("/autocomplete", async (req, res) => {
  const { q } = req.query;
  const locationIqKey = process.env.LOCATION_IQ_API_KEY;
  if (!locationIqKey) return res.status(500).json({ error: "Missing LocationIQ API Key on Server" });
  if (!q) return res.status(400).json({ error: "Missing query" });
  
  try {
    const url = `https://api.locationiq.com/v1/autocomplete.php?key=${locationIqKey}&q=${encodeURIComponent(q)}&limit=5&format=json`;
    const locationRes = await fetch(url);
    const data = await locationRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "vac-ai-tion-api" });
});

exports.api = onRequest({ maxInstances: 10 }, app);

if (require.main === module) {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
