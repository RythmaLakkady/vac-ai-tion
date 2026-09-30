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
  }
};
