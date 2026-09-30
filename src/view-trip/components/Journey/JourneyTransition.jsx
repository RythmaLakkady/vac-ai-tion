import React, { useState, useEffect } from 'react';
import { ArrowDown, Navigation } from 'lucide-react';
import { feasibilityEngine } from '../../../service/feasibilityEngine';

export default function JourneyTransition({ fromStop, toStop }) {
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    if (fromStop?.geo_coordinates && toStop?.geo_coordinates) {
      const dist = feasibilityEngine.getDistanceInMeters(
        fromStop.geo_coordinates.lat || fromStop.geo_coordinates.latitude,
        fromStop.geo_coordinates.lng || fromStop.geo_coordinates.longitude,
        toStop.geo_coordinates.lat || toStop.geo_coordinates.latitude,
        toStop.geo_coordinates.lng || toStop.geo_coordinates.longitude
      );
      if (dist > 0) {
        setDistance(dist);
      }
    }
  }, [fromStop, toStop]);
  
  const isFar = distance > 10000; // >10km
  const distText = distance ? (distance > 1000 ? `${(distance/1000).toFixed(1)} km` : `${Math.round(distance)} m`) : null;
  
  return (
    <div className="relative flex items-center gap-4 sm:gap-6 my-1 sm:my-2">
      <div className="flex flex-col items-center w-4 mt-2 mb-2">
        <div className="w-[2px] h-12 sm:h-16 bg-border relative">
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-border bg-gray-50/50 backdrop-blur-sm p-1 rounded-full">
            <ArrowDown className="w-3 h-3" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 py-1">
        {distText ? (
          <span className={`text-xs font-semibold flex items-center gap-1.5 ${isFar ? 'text-amber' : 'text-ink/50'}`}>
            <Navigation className="w-3 h-3" />
            Est. distance: {distText}
            {isFar && <span className="ml-1 px-1.5 py-0.5 bg-amber/10 rounded-sm text-[10px] uppercase">Travel-heavy</span>}
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-ink/30 tracking-widest uppercase">
            Travel details unavailable
          </span>
        )}
      </div>
    </div>
  );
}
