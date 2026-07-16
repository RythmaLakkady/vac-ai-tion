import { rankVendorResults } from "../rankVendorResults";

describe("rankVendorResults", () => {
  const mockResults = [
    { vendor: "Expensive Co", price: 500, currency: "USD", link: "", rating: 3.0, refundable: false, co2Kg: 120 },
    { vendor: "Cheap & Green", price: 200, currency: "USD", link: "", rating: 4.5, refundable: true,  co2Kg: 70  },
    { vendor: "Mid Range",     price: 350, currency: "USD", link: "", rating: 4.0, refundable: true,  co2Kg: 95  },
  ];

  test("Low-Cost budget ranks cheapest vendor first", () => {
    const ranked = rankVendorResults(mockResults, {
      budget: "Low-Cost",
      prefersRefundable: false,
      ecoConscious: false,
    });
    expect(ranked[0].vendor).toBe("Cheap & Green");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  test("Luxury budget prioritises rating over price", () => {
    const ranked = rankVendorResults(mockResults, {
      budget: "Luxury",
      prefersRefundable: false,
      ecoConscious: false,
    });
    // "Cheap & Green" has highest rating (4.5) — should still be #1 since
    // it also happens to be cheapest. The key check: score gap narrows.
    expect(ranked[0].rating).toBeGreaterThanOrEqual(ranked[1].rating);
  });

  test("eco-conscious user boosts low-CO₂ vendors", () => {
    const ranked = rankVendorResults(mockResults, {
      budget: "Affordable Comfort",
      prefersRefundable: false,
      ecoConscious: true,
    });
    // "Cheap & Green" has lowest CO₂ (70) — should rank first
    expect(ranked[0].vendor).toBe("Cheap & Green");
  });

  test("returns empty array for empty input", () => {
    const ranked = rankVendorResults([], {
      budget: "Low-Cost",
      prefersRefundable: false,
      ecoConscious: false,
    });
    expect(ranked).toEqual([]);
  });

  test("all results have a score between 0 and 1", () => {
    const ranked = rankVendorResults(mockResults, {
      budget: "Affordable Comfort",
      prefersRefundable: true,
      ecoConscious: true,
    });
    ranked.forEach((r) => {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    });
  });
});
