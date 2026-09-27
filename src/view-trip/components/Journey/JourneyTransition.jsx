import React from 'react';
import { ArrowDown } from 'lucide-react';

export default function JourneyTransition({ fromStop, toStop }) {
  // Extracting possible travel information if it exists in the data.
  // The current schema might not have dedicated transition blocks yet,
  // so we fallback to a visual connector.
  const hasTravelData = false; 
  
  return (
    <div className="relative flex items-center gap-4 sm:gap-6 my-2 sm:my-3">
      <div className="flex flex-col items-center w-4 mt-2 mb-2">
        <div className="w-[2px] h-12 sm:h-16 bg-border relative">
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-border bg-gray-50/50 backdrop-blur-sm p-1 rounded-full">
            <ArrowDown className="w-3 h-3" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 py-2">
        {hasTravelData ? (
          <span className="text-xs font-semibold text-ink/60 flex items-center gap-2">
            {/* Future placeholder for 14 min walk etc */}
            14 min walk
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
