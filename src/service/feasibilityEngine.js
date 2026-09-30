export const feasibilityEngine = {
  analyzeDay(day, dayIndex) {
    const warnings = [];
    if (!day || !day.activities) return warnings;

    const activities = day.activities;
    const numStops = activities.length;

    // 1. Overload detection
    if (numStops > 4) {
      warnings.push({
        severity: 'warning',
        type: 'overload',
        title: 'Ambitious Schedule',
        explanation: `${numStops} stops in one day is travel-heavy. Consider moving some to another day or replacing them with nearby alternatives to allow more buffer time.`,
        action: 'Review stops',
        dayIndex
      });
    }

    // 2. Parse time (rough heuristic)
    let totalEstimatedMinutes = 0;
    let missingTiming = 0;

    activities.forEach((act, idx) => {
      let mins = 0;
      if (act.time_travel) {
        const timeStr = String(act.time_travel).toLowerCase();
        const hrsMatch = timeStr.match(/([0-9.]+)\s*(hr|hour|h)/);
        const minsMatch = timeStr.match(/([0-9]+)\s*(min|m)/);
        
        if (hrsMatch) mins += parseFloat(hrsMatch[1]) * 60;
        if (minsMatch) mins += parseInt(minsMatch[1]);
      }
      
      if (mins > 0) {
        totalEstimatedMinutes += mins;
      } else {
        missingTiming++;
      }

      // Check distance from previous stop if coordinates exist
      if (idx > 0) {
        const prev = activities[idx - 1];
        if (act.geo_coordinates && prev.geo_coordinates) {
          const dist = this.getDistanceInMeters(
            prev.geo_coordinates.lat || prev.geo_coordinates.latitude,
            prev.geo_coordinates.lng || prev.geo_coordinates.longitude,
            act.geo_coordinates.lat || act.geo_coordinates.latitude,
            act.geo_coordinates.lng || act.geo_coordinates.longitude
          );
          
          if (dist > 50000) { // 50km
            warnings.push({
              severity: 'warning',
              type: 'distance',
              title: 'Long Travel Transition',
              explanation: `The transition from ${prev.place_name} to ${act.place_name} is approx ${Math.round(dist/1000)}km. This will consume significant time.`,
              action: 'Preview reorder',
              dayIndex,
              stopId: idx
            });
          }
        }
      }
    });

    if (totalEstimatedMinutes > 480) { // > 8 hours of active stuff
      warnings.push({
        severity: 'info',
        type: 'exhaustion',
        title: 'Full Day Ahead',
        explanation: `This day has over 8 hours of planned activity time. Make sure you build in rest stops or meal buffers.`,
        action: 'View alternatives',
        dayIndex
      });
    }

    return warnings;
  },

  getDistanceInMeters(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371e3;
    const p1 = lat1 * Math.PI/180;
    const p2 = lat2 * Math.PI/180;
    const dp = (lat2-lat1) * Math.PI/180;
    const dl = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  getTransportOptions(distanceMeters) {
    if (!distanceMeters || distanceMeters <= 0) return [];
    
    const options = [];
    
    // Walk option (if less than 2.5km)
    if (distanceMeters < 2500) {
      const walkMins = Math.round(distanceMeters / 80); // ~4.8 km/h
      options.push({
        mode: 'Walk',
        duration: `${walkMins} min`,
        distance: distanceMeters > 1000 ? `${(distanceMeters/1000).toFixed(1)} km` : `${Math.round(distanceMeters)} m`,
        cost: null
      });
    }

    // Cab option
    // Base 5 mins wait + drive time at ~24 km/h (400 m/min)
    const driveMins = 5 + Math.round(distanceMeters / 400); 
    const minDriveMins = Math.max(Math.floor(driveMins * 0.8), 2);
    const maxDriveMins = Math.ceil(driveMins * 1.3);

    // Rough cost heuristic: base $3 + $1.5 per km
    // We will just provide a relative "Est." since we don't have perfect currency knowledge here, 
    // or we just omit the exact price and say "Metered fare".
    options.push({
      mode: 'Cab/Ride',
      duration: `${minDriveMins}–${maxDriveMins} min`,
      distance: distanceMeters > 1000 ? `${(distanceMeters/1000).toFixed(1)} km` : `${Math.round(distanceMeters)} m`,
      cost: 'Metered fare'
    });

    if (distanceMeters > 5000) {
      options.push({
        mode: 'Public Transport',
        duration: 'Times vary',
        distance: `${(distanceMeters/1000).toFixed(1)} km`,
        cost: 'Check local transit apps'
      });
    }

    return options;
  },

  getItineraryScore(itinerary) {
    if (!itinerary || itinerary.length === 0) {
      return { score: null, strengths: [], warnings: [], status: 'unavailable', skippable: [], replaceable: [], additions: [] };
    }

    let score = 100;
    const strengths = [];
    const warnings = [];
    const skippable = [];
    const replaceable = [];
    const additions = [];
    
    let totalStops = 0;
    let daysWithOverload = 0;
    let daysWithLongTransitions = 0;
    let daysWellPaced = 0;

    itinerary.forEach((day, idx) => {
      const dayWarnings = this.analyzeDay(day, idx);
      if (!day.activities || day.activities.length === 0) return;
      
      totalStops += day.activities.length;

      const hasOverload = dayWarnings.some(w => w.type === 'overload' || w.type === 'exhaustion');
      const hasDistance = dayWarnings.some(w => w.type === 'distance');

      if (hasOverload) daysWithOverload++;
      if (hasDistance) daysWithLongTransitions++;
      
      if (!hasOverload && !hasDistance && day.activities.length >= 2 && day.activities.length <= 4) {
        daysWellPaced++;
      }
    });

    if (totalStops === 0) {
      return { score: null, strengths: [], warnings: [], status: 'unavailable' };
    }

    // Deductions
    const overloadDeduction = daysWithOverload * 15;
    const distanceDeduction = daysWithLongTransitions * 10;
    
    score -= (overloadDeduction + distanceDeduction);
    score = Math.max(score, 30); // Floor at 30

    // Strengths
    if (daysWellPaced > 0 && daysWellPaced === itinerary.length) {
      strengths.push('Excellent pacing across all days');
    } else if (daysWellPaced > 0) {
      strengths.push('Good geographic grouping on most days');
    }

    if (distanceDeduction === 0 && totalStops > 2) {
      strengths.push('Highly efficient routing (no long transitions)');
      additions.push('Since routing is efficient, you can easily add a nearby local gem without ruining your pace.');
    }

    // Warnings
    if (daysWithOverload > 0) {
      warnings.push(`${daysWithOverload} day(s) have very ambitious schedules`);
      skippable.push(`Consider skipping one activity on the most packed days to avoid rushing.`);
    }
    if (daysWithLongTransitions > 0) {
      warnings.push(`Contains travel-heavy transitions`);
      replaceable.push(`Some locations are far apart. Consider replacing isolated stops with nearby alternatives.`);
    }

    // PDF Import specific
    itinerary.forEach((dayObj, i) => {
       dayObj.plan?.forEach(p => {
          if (p.uncertain) {
             replaceable.push(`The timing for ${p.placeName} is uncertain. Verify it or find a known alternative.`);
          }
       });
    });

    // Default strength if nothing else
    if (strengths.length === 0 && warnings.length === 0) {
      strengths.push('Balanced standard itinerary');
    }

    return {
      score,
      strengths,
      warnings,
      status: 'available',
      skippable,
      replaceable,
      additions
    };
  }
};
