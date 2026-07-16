/**
 * rankVendorResults.js  (client-side copy)
 *
 * Same personalization logic as the Cloud Function, but usable in the
 * React frontend for instant client-side re-ranking without a round-trip.
 *
 * WEIGHTS (normalised to sum = 1.0):
 *   price       (default 0.40)  — lower price → higher score
 *   rating      (default 0.25)  — higher vendor rating → higher score
 *   refundable  (default 0.20)  — refundable → bonus points
 *   eco         (default 0.15)  — lower CO₂ → higher score
 */

/**
 * @param {Array} results - array of { vendor, price, rating, refundable, co2Kg, ... }
 * @param {{ budget: string, prefersRefundable: boolean, ecoConscious: boolean }} prefs
 * @returns {Array} sorted results with an added `score` field (0–1, higher = better)
 */
export function rankVendorResults(results, prefs) {
  if (!results || results.length === 0) return [];

  // Base weights — shift based on user preference
  const w = {
    price:      prefs.budget === "Luxury" ? 0.15 : 0.40,
    rating:     prefs.budget === "Luxury" ? 0.40 : 0.25,
    refundable: prefs.prefersRefundable   ? 0.30 : 0.20,
    eco:        prefs.ecoConscious        ? 0.25 : 0.15,
  };

  // Normalise so they sum to 1
  const total = w.price + w.rating + w.refundable + w.eco;
  w.price      /= total;
  w.rating     /= total;
  w.refundable /= total;
  w.eco        /= total;

  // Min / max for normalisation
  const prices = results.map((r) => r.price);
  const co2s   = results.map((r) => r.co2Kg);
  const [minP, maxP] = [Math.min(...prices), Math.max(...prices)];
  const [minC, maxC] = [Math.min(...co2s),   Math.max(...co2s)];

  return results
    .map((r) => {
      const priceScore  = maxP === minP ? 1 : 1 - (r.price - minP) / (maxP - minP);
      const ratingScore = r.rating / 5;
      const refundScore = r.refundable ? 1 : 0;
      const ecoScore    = maxC === minC ? 1 : 1 - (r.co2Kg - minC) / (maxC - minC);

      const score =
        w.price      * priceScore  +
        w.rating     * ratingScore +
        w.refundable * refundScore +
        w.eco        * ecoScore;

      return { ...r, score: Math.round(score * 100) / 100 };
    })
    .sort((a, b) => b.score - a.score);
}
