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
const aiCache = new Map();

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
    const cacheKey = `alt_${context.currentStop.place_name}_${context.location}_${context.reason}`;
    if (aiCache.has(cacheKey)) return aiCache.get(cacheKey);

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
      const resultData = alternatives.map(alt => ({
        ...alt,
        costState: alt.ticket_pricing === 'Free' || alt.ticket_pricing === 'unknown' ? 'unknown' : 'estimated'
      }));
      aiCache.set(cacheKey, resultData);
      return resultData;
    } catch (e) {
      console.error("Alternatives failed:", e);
      throw new Error("Alternatives are temporarily unavailable.");
    }
  },

  async getLocalGems(context) {
    const cacheKey = `gems_${context.currentStop?.place_name}_${context.location}_${context.season}`;
    if (aiCache.has(cacheKey)) return aiCache.get(cacheKey);

    const prompt = `
      Act as a strict travel expert API finding local/hidden gems. Find 2-3 highly relevant hidden gems near this route.
      Current Stop: ${context.currentStop?.place_name || 'Start of day'}
      Current Location: ${context.location}
      Previous Stop: ${context.previousStop?.place_name || 'Start of day'}
      Next Stop: ${context.nextStop?.place_name || 'End of day'}
      Trip Budget: ${context.budget || 'Unknown'}
      Trip Preferences: ${context.preferences || 'Unknown'}
      Season: ${context.season || 'Unknown'}
      
      A hidden gem must:
      1. Not be simply a random unpopular place.
      2. Naturally fit the current Journey between the previous and next stop.
      3. Make sense for the season and budget.
      
      Return ONLY a valid JSON array of objects with exactly this structure:
      [
        {
          "place_name": "Name of the local gem",
          "place_details": "What it is and what to do there",
          "reason_why": "Why this specifically fits this journey (e.g. '10 min from your current stop and naturally fits before your next activity.')",
          "category": "Activity or Food, etc.",
          "time_travel": "Estimated duration (e.g. 45 mins)",
          "ticket_pricing": "Estimated cost (e.g. $5, or Free)",
          "geo_coordinates": { "lat": Number, "lng": Number }
        }
      ]
    `;

    try {
      const result = await chatSession.sendMessage(prompt);
      const text = await result.response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Failed to parse local gems");
      
      const gems = JSON.parse(jsonMatch[0]);
      const resultData = gems.map(gem => ({
        ...gem,
        costState: gem.ticket_pricing === 'Free' || gem.ticket_pricing === 'unknown' ? 'unknown' : 'estimated'
      }));
      aiCache.set(cacheKey, resultData);
      return resultData;
    } catch (e) {
      console.error("Local gems failed:", e);
      throw new Error("Local gems are temporarily unavailable.");
    }
  },

  async getStopIntelligence(context) {
    const cacheKey = `intel_${context.currentStop?.place_name}_${context.location}_${context.season}`;
    if (aiCache.has(cacheKey)) return aiCache.get(cacheKey);

    const prompt = `
      Act as an AI itinerary analyzer.
      Stop: ${context.currentStop?.place_name || 'Unknown'}
      Destination: ${context.location}
      Season: ${context.season || 'Unknown'}
      Profile: ${context.traveler || 'Unknown'}
      
      Analyze this specific stop for this specific trip and return ONLY a valid JSON object:
      {
        "priority": "MUST-DO" | "RECOMMENDED" | "OPTIONAL" | "CONSIDER SKIPPING",
        "priority_reason": "Why this priority was assigned (e.g. 'Iconic must-do' or 'Too similar to previous stop')",
        "seasonality": "GOOD FOR THIS SEASON" | "SEASONALLY DEPENDENT" | "LESS SUITABLE" | "UNKNOWN",
        "seasonality_reason": "Why this seasonality applies based on the travel dates."
      }
    `;

    try {
      const result = await chatSession.sendMessage(prompt);
      const text = await result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      const resultData = JSON.parse(jsonMatch[0]);
      aiCache.set(cacheKey, resultData);
      return resultData;
    } catch (e) {
      console.error("Stop intelligence failed:", e);
      return null;
    }
  },

  async understandActivity(context) {
    const cacheKey = `understand_${context.currentStop?.place_name}_${context.location}`;
    if (aiCache.has(cacheKey)) return aiCache.get(cacheKey);

    const prompt = `
      Act as a strict travel expert API providing context for an imported itinerary activity.
      Activity/Place: ${context.currentStop?.place_name || 'Unknown'}
      Details from itinerary: ${context.currentStop?.place_details || 'Unknown'}
      Destination: ${context.location}
      Previous Stop: ${context.previousStop?.place_name || 'Start of day'}
      Next Stop: ${context.nextStop?.place_name || 'End of day'}
      
      Explain what this activity is, why it might appear in their imported itinerary, what they actually do there, what to know before going, and whether it fits their journey.
      Return ONLY a valid JSON object with exactly this structure:
      {
        "what_it_is": "What the place/activity actually is.",
        "why_included": "Why it likely appears in their itinerary.",
        "what_to_do": "What the traveler actually does there.",
        "know_before_going": "Important practical tip.",
        "journey_fit": "Analysis of how it fits between the previous and next stops."
      }
    `;

    try {
      const result = await chatSession.sendMessage(prompt);
      const text = await result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      const resultData = JSON.parse(jsonMatch[0]);
      aiCache.set(cacheKey, resultData);
      return resultData;
    } catch (e) {
      console.error("Understand activity failed:", e);
      return null;
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
  },

  async getDestinationContext(context) {
    const cacheKey = `destCtx_${context.location}_${context.currentStop?.place_name}_${context.traveler}`;
    if (aiCache.has(cacheKey)) return aiCache.get(cacheKey);

    const prompt = `
      Act as a contextual travel guide for a user currently planning their trip.
      Destination Area: ${context.location}
      Current Stop: ${context.currentStop?.place_name || 'Unknown'}
      Previous Stop: ${context.previousStop?.place_name || 'Start of day'}
      Next Stop: ${context.nextStop?.place_name || 'End of day'}
      Trip Profile: ${context.traveler || 'Unknown'} traveler, Budget: ${context.budget || 'Unknown'}
      
      Generate a contextual guide that helps the user understand how this location fits into their SPECIFIC journey.
      Return ONLY a valid JSON object with EXACTLY this structure:
      {
        "overview": "Short editorial introduction to this area.",
        "why_here": "Explain the relationship between this area and their current journey (e.g. 'You are spending the afternoon here between X and Y...'). DO NOT fabricate itinerary relationships.",
        "know_before_you_go": [
          "Practical tip 1 (e.g., opening considerations, etiquette)",
          "Practical tip 2"
        ],
        "journey_impact": [
          "Actionable advice (e.g. 'This museum usually takes 3 hours. Consider moving your next stop later.')",
          "Actionable advice 2"
        ],
        "useful_resources": [
          { "title": "Official Tourism Board", "reason": "Official info", "url": "https://example.com" }
        ]
      }
    `;

    try {
      const result = await chatSession.sendMessage(prompt);
      const text = await result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to parse guide context");
      
      const resultData = JSON.parse(jsonMatch[0]);
      aiCache.set(cacheKey, resultData);
      return resultData;
    } catch (e) {
      console.error("Destination context failed:", e);
      throw new Error("Destination guide is temporarily unavailable.");
    }
  }
};
