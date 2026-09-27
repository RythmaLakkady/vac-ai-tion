import { chatSession } from './AImodel';

// Calculate rough distance in meters
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Rough walking time (1.4 m/s is ~5km/h)
function estimateWalkingTime(meters) {
  const mins = Math.round(meters / 84);
  if (mins < 1) return '1 min walk';
  if (mins > 60) return '60+ min walk';
  return `${mins} min walk`;
}

const nearbyCache = new Map();

export const journeyIntelligence = {
  // Trustworthy Nearby Search using OpenStreetMap (Overpass API)
  async getNearbyPlaces(lat, lng, category) {
    if (!lat || !lng) throw new Error("Location unavailable");
    
    const cacheKey = `${lat},${lng},${category}`;
    if (nearbyCache.has(cacheKey)) {
      return nearbyCache.get(cacheKey);
    }
    
    const tagMap = {
      'Food': 'amenity=restaurant',
      'Cafés': 'amenity=cafe',
      'Parks': 'leisure=park',
      'Shopping': 'shop',
      'Attractions': 'tourism=museum',
      'Essentials': 'amenity=pharmacy'
    };
    
    const tag = tagMap[category] || 'amenity=cafe';
    const query = `[out:json][timeout:10];(node[${tag}](around:1000,${lat},${lng});way[${tag}](around:1000,${lat},${lng}););out center 15;`;
    
    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter`, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      if (!response.ok) throw new Error("Provider unavailable");
      const data = await response.json();
      
      const results = data.elements.map(el => {
        const name = el.tags?.name;
        if (!name) return null;
        
        const elLat = el.lat || el.center?.lat;
        const elLon = el.lon || el.center?.lon;
        const dist = getDistanceInMeters(lat, lng, elLat, elLon);
        
        return {
          id: el.id,
          place_name: name,
          geo_coordinates: { lat: elLat, lng: elLon },
          category: category,
          distanceMeters: dist,
          distance: estimateWalkingTime(dist),
          ticket_pricing: 'unknown',
          time_travel: '1 hr'
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      const finalResults = results.slice(0, 5);
      nearbyCache.set(cacheKey, finalResults);
      return finalResults;
    } catch (e) {
      console.error("Nearby search failed:", e);
      throw new Error("Nearby places are temporarily unavailable.");
    }
  },

  // LLM-based Alternatives with strict prompt
  async getAlternatives(context) {
    const prompt = `
      Act as a strict travel expert API. Find 2 REAL alternative places to replace this stop:
      Current Stop: ${context.currentStop.place_name}
      Current Location: ${context.location}
      Previous Stop: ${context.previousStop?.place_name || 'Start of day'}
      Next Stop: ${context.nextStop?.place_name || 'End of day'}
      Trip Budget: ${context.budget || 'Unknown'}
      Trip Preferences: ${context.preferences || 'Unknown'}
      Reason for changing: User wants something ${context.reason}
      
      The alternatives MUST be real, famous, or verifiable places in or near ${context.location}. 
      They must fit within the context of the previous and next stops, and respect the budget and preferences. DO NOT hallucinate.
      
      Return ONLY a valid JSON array of objects with exactly this structure:
      [
        {
          "place_name": "Name of the alternative",
          "place_details": "Why this matches the reason and fits the journey",
          "category": "Activity or Museum, etc.",
          "time_travel": "Estimated duration (e.g. 2 hrs)",
          "ticket_pricing": "Estimated cost (e.g. $15, or Free)",
          "geo_coordinates": { "lat": Number, "lng": Number }
        }
      ]
    `;

    try {
      const result = await chatSession.sendMessage(prompt);
      const text = await result.response.text();
      // Safely parse JSON from markdown code block if present
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Failed to parse alternatives");
      
      const alternatives = JSON.parse(jsonMatch[0]);
      return alternatives.map(alt => ({
        ...alt,
        costState: alt.ticket_pricing === 'Free' || alt.ticket_pricing === 'unknown' ? 'unknown' : 'estimated'
      }));
    } catch (e) {
      console.error("Alternatives failed:", e);
      throw new Error("Alternatives are temporarily unavailable.");
    }
  },
  
  // Calculate impact of adding a stop between two others
  calculateImpact(newStop, previousStop, nextStop) {
    // Basic logic to demonstrate impact preview
    let minutesAdded = parseInt(newStop.time_travel) || 60; 
    let costAdded = newStop.ticket_pricing !== 'unknown' && newStop.ticket_pricing !== 'Free' ? newStop.ticket_pricing : null;
    
    let timeImpact = "Timing impact unavailable — please review the schedule.";
    if (newStop.time_travel) {
        timeImpact = `+${newStop.time_travel} estimated`;
    }

    return {
      timeImpact,
      costImpact: costAdded ? `+${costAdded} estimated` : null,
      compatible: true
    };
  }
};
