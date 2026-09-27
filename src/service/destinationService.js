import { FUNCTION_URL } from './config';

export const destinationService = {
  async searchDestinations(query) {
    if (!query || query.length <= 2) return [];
    
    try {
      const res = await fetch(`${FUNCTION_URL}/autocomplete?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      return await res.json();
    } catch (error) {
      console.error("Autocomplete error:", error);
      return [];
    }
  }
};
