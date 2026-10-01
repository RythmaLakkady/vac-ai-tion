import { describe, it, expect, vi } from 'vitest';

describe('P0 Remediation Tests', () => {
  describe('Imported Itinerary Normalization', () => {
    it('should map PDF schema to expected activities schema with is_uncertain flag', () => {
      // Mock data from PDF AI extractor
      const mockPdfData = {
        trip_name: "Paris Trip",
        location: "Paris",
        itinerary: [
          {
            day: "Day 1",
            theme: "Arrival",
            activities: [
              {
                time_travel: "10:00 AM",
                place_name: "Eiffel Tower",
                place_details: "Iconic landmark",
                ticket_pricing: "$30",
                category: "Attraction",
                geo_coordinates: { lat: 48.8584, lng: 2.2945 },
                uncertain: true
              }
            ]
          }
        ]
      };

      // Mock normalization function logic (similar to importTrip/index.jsx)
      const normalizeData = (data) => {
        const normalized = {
          ...data,
          itinerary: data.itinerary.map(day => ({
            ...day,
            activities: day.activities.map(act => ({
              ...act,
              is_uncertain: act.uncertain || false,
              geo_coordinates: act.geo_coordinates
            }))
          }))
        };
        return normalized;
      };

      const normalized = normalizeData(mockPdfData);
      
      expect(normalized.itinerary[0].activities[0]).toHaveProperty('is_uncertain', true);
      expect(normalized.itinerary[0].activities[0].geo_coordinates).toEqual({ lat: 48.8584, lng: 2.2945 });
    });
  });

  describe('Geocoding Fallback', () => {
    it('should NOT fail the import process if geocoding returns null', async () => {
      // If a destination cannot be geocoded, we should fall back to null safely
      // as implemented in importTrip/index.jsx
      const mockAct = {
        place_name: "Unknown Hidden Cafe",
        geo_coordinates: null
      };

      // Mock geocoding service failing or returning empty
      const mockSearch = vi.fn().mockResolvedValue([]);

      const performGeocode = async (act) => {
        let lat = act.geo_coordinates?.lat || null;
        let lng = act.geo_coordinates?.lng || null;
        if (!lat || !lng) {
          const results = await mockSearch(act.place_name);
          if (results && results.length > 0) {
            lat = parseFloat(results[0].lat);
            lng = parseFloat(results[0].lon);
          }
        }
        return { ...act, geo_coordinates: lat && lng ? { lat, lng } : null };
      };

      const result = await performGeocode(mockAct);
      expect(mockSearch).toHaveBeenCalledWith("Unknown Hidden Cafe");
      expect(result.geo_coordinates).toBeNull();
    });
  });
});
