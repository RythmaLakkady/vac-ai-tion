import { FUNCTION_URL } from './config';

const geocodeCache = new Map();

export const destinationService = {
  async searchDestinations(query) {
    if (!query || query.length <= 2) return [];
    
    if (geocodeCache.has(query)) return geocodeCache.get(query);
    
    try {
      const res = await fetch(`${FUNCTION_URL}/autocomplete?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        geocodeCache.set(query, data);
        return data;
      }
      throw new Error("Empty or invalid results from primary API");
    } catch (error) {
      console.warn("Primary autocomplete failed, trying fallbacks:", error);
      
      // Fallback 1: Direct LocationIQ (if key is still in .env)
      const localKey = import.meta.env.VITE__LOCATION_IQ_API_KEY || import.meta.env.VITE_LOCATION_IQ_API_KEY;
      if (localKey) {
        try {
          const lqRes = await fetch(`https://api.locationiq.com/v1/autocomplete.php?key=${localKey}&q=${encodeURIComponent(query)}&limit=5&format=json`);
          const lqData = await lqRes.json();
          if (Array.isArray(lqData) && lqData.length > 0) {
            geocodeCache.set(query, lqData);
            return lqData;
          }
        } catch (lqErr) {
          console.error("Direct LocationIQ fallback failed:", lqErr);
        }
      }

      // Fallback 2: Nominatim OpenStreetMap (No custom headers to avoid CORS preflight)
      try {
        const fallbackRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
        const fallbackData = await fallbackRes.json();
        if (Array.isArray(fallbackData) && fallbackData.length > 0) {
          const mapped = fallbackData.map(item => ({
            display_name: item.display_name,
            lat: item.lat,
            lon: item.lon
          }));
          geocodeCache.set(query, mapped);
          return mapped;
        }
        return [{ display_name: query, isCustom: true }];
      } catch (fallbackError) {
        console.error("Fallback autocomplete error:", fallbackError);
        return [{ display_name: query, isCustom: true }];
      }
    }
  }
};
