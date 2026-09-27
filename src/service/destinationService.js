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
      console.warn("Primary autocomplete failed, trying fallback:", error);
      try {
        const fallbackRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`, {
          headers: {
            'User-Agent': 'vac-ai-tion/1.0 (Fallback Autocomplete)'
          }
        });
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
