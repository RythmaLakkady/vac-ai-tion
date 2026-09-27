import { FUNCTION_URL } from './config';

export const destinationService = {
  async searchDestinations(query) {
    if (!query || query.length <= 2) return [];
    
    try {
      const res = await fetch(`${FUNCTION_URL}/autocomplete?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
      throw new Error("Empty or invalid results from primary API");
    } catch (error) {
      console.warn("Primary autocomplete failed, trying fallbacks:", error);
      
      // Fallback 1: Direct LocationIQ (if key is still in .env)
      const localKey = import.meta.env.VITE__LOCATION_IQ_API_KEY || import.meta.env.VITE_LOCATION_IQ_API_KEY;
      if (localKey) {
        try {
          const lqRes = await fetch(`https://api.locationiq.com/v1/autocomplete.php?key=${localKey}&q=${encodeURIComponent(query)}&limit=5&format=json`);
          const lqData = await lqRes.json();
          if (Array.isArray(lqData) && lqData.length > 0) return lqData;
        } catch (lqErr) {
          console.error("Direct LocationIQ fallback failed:", lqErr);
        }
      }

      // Fallback 2: Nominatim OpenStreetMap (No custom headers to avoid CORS preflight)
      try {
        const fallbackRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
        const fallbackData = await fallbackRes.json();
        if (Array.isArray(fallbackData) && fallbackData.length > 0) {
          return fallbackData.map(item => ({
            display_name: item.display_name,
            lat: item.lat,
            lon: item.lon
          }));
        }
        return [{ display_name: query, isCustom: true }];
      } catch (fallbackError) {
        console.error("Fallback autocomplete error:", fallbackError);
        return [{ display_name: query, isCustom: true }];
      }
    }
  }
};
