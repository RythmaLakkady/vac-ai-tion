/**
 * cacheUtils.js
 *
 * Hash-based caching for LLM itinerary responses.
 * Before creating a new agent job, we hash the query parameters
 * and check if a cached result already exists in Firestore.
 */
const crypto = require("crypto");
const admin = require("firebase-admin");

/**
 * Creates a deterministic SHA-256 hash of the query parameters.
 */
function createQueryHash(query) {
  const normalized = JSON.stringify({
    destination: query.destination.trim().toLowerCase(),
    days: query.days,
    budget: query.budget.trim().toLowerCase(),
    travelers: query.travelers.trim().toLowerCase(),
  });
  return crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

/**
 * Checks if a cached itinerary exists for the given hash.
 * Returns the cached data or null.
 */
async function getCachedItinerary(hash) {
  const db = admin.firestore();
  const snap = await db
    .collection("itineraryCache")
    .where("queryHash", "==", hash)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const doc = snap.docs[0];
  const data = doc.data();
  return { tripData: data.tripData, jobId: doc.id };
}

/**
 * Saves a completed itinerary to cache.
 */
async function cacheItinerary(hash, tripData, jobId) {
  const db = admin.firestore();
  await db.collection("itineraryCache").doc(jobId).set({
    queryHash: hash,
    tripData,
    status: "completed",
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

module.exports = {
  createQueryHash,
  getCachedItinerary,
  cacheItinerary
};
