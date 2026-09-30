import React, { useState, useEffect } from 'react';
import { ArrowDown, Navigation, Car, Footprints, Train } from 'lucide-react';
import { feasibilityEngine } from '../../../service/feasibilityEngine';

export default function JourneyTransition({ fromStop, toStop }) {
  const [distance, setDistance] = useState(null);
  const [transportOptions, setTransportOptions] = useState([]);

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
        setTransportOptions(feasibilityEngine.getTransportOptions(dist));
      }
    }
  }, [fromStop, toStop]);
  
  const isFar = distance > 10000; // >10km
  const distText = distance ? (distance > 1000 ? `${(distance/1000).toFixed(1)} km` : `${Math.round(distance)} m`) : null;
  
  const getIcon = (mode) => {
    if (mode === 'Walk') return <Footprints className="w-3 h-3 text-ink/40" />;
    if (mode === 'Cab/Ride') return <Car className="w-3 h-3 text-ink/40" />;
    return <Train className="w-3 h-3 text-ink/40" />;
  };
  
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
          <div className="flex flex-col gap-1.5">
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${isFar ? 'text-amber' : 'text-ink/50'}`}>
              <Navigation className="w-3 h-3" />
              Est. distance: {distText}
              {isFar && <span className="ml-1 px-1.5 py-0.5 bg-amber/10 rounded-sm text-[10px] uppercase">Travel-heavy</span>}
            </span>
            {transportOptions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {transportOptions.map((opt, i) => (
                  <div key={i} className="flex flex-col bg-white border border-border/50 rounded-md p-1.5 px-2 shadow-sm min-w-[100px]">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[10px] uppercase font-bold text-ink/40 flex items-center gap-1">
                        {getIcon(opt.mode)} {opt.mode}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-ink/70">{opt.duration}</span>
                    {opt.cost && <span className="text-[10px] text-ink/40 mt-0.5">{opt.cost}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span className="text-[11px] font-semibold text-ink/30 tracking-widest uppercase">
            Transport details unavailable
          </span>
        )}
      </div>
    </div>
  );
}
