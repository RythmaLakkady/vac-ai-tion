/**
 * rankVendorResults.js
 *
 * Personalization scoring — ranks vendor results by user preferences.
 */

// ── Scoring function ─────────────────────────────────────
function rankVendorResults(results, prefs) {
  if (results.length === 0) return [];

  // Base weights — adjusted per preference
  const w = {
    price:      prefs.budget === "Luxury" ? 0.15 : 0.40,
    rating:     prefs.budget === "Luxury" ? 0.40 : 0.25,
    refundable: prefs.prefersRefundable   ? 0.30 : 0.20,
    eco:        prefs.ecoConscious        ? 0.25 : 0.15,
  };

  // Normalise so weights sum to 1
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
    .sort((a, b) => b.score - a.score); // highest score first
}

module.exports = {
  rankVendorResults
};
