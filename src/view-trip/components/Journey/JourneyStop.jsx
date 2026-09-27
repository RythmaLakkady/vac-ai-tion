import React, { useState } from 'react';
import { Wallet, MoreVertical, MapPin, Edit2, Replace, Trash2, StickyNote } from 'lucide-react';
import { analytics } from '@/service/analyticsService';

export default function JourneyStop({ activity, dayIndex, activityIndex }) {
  const [expanded, setExpanded] = useState(false);

  // Destructure with fallbacks
  const placeName = activity?.place_name || "Unknown Stop";
  const category = activity?.category || "Activity";
  const time = activity?.time_travel || "";
  const cost = activity?.ticket_pricing && activity.ticket_pricing !== "N/A" ? activity.ticket_pricing : null;
  const why = activity?.importance || null;

  // Determine if it's a primary stop based on heuristics
  const isPrimary = why || category.toLowerCase().includes("museum") || category.toLowerCase().includes("attraction");

  const toggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (newExpanded) {
      analytics.trackEvent('stop_opened', { placeName, category, dayIndex });
    }
  };

  return (
    <div className="relative flex items-start gap-4 sm:gap-6 group outline-none">
      {/* Node / Marker */}
      <div className="flex flex-col items-center mt-6">
        <div className={`w-4 h-4 rounded-full shadow-sm z-10 ${isPrimary ? 'bg-amber ring-4 ring-amber/20' : 'bg-ink/40'}`} />
      </div>

      {/* Stop Card */}
      <div className="flex-1 pb-1 w-full">
        <div 
          onClick={toggleExpand}
          className="bg-card hover:bg-gray-50/80 border border-border shadow-sm rounded-3xl p-5 sm:p-6 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber outline-none"
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-widest text-ink/50">{category}</span>
                {time && <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md whitespace-nowrap">{time}</span>}
              </div>
              <h4 className="text-xl font-bold font-serif text-ink">{placeName}</h4>
            </div>
            
            <button 
              className="text-gray-400 hover:text-ink opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 -mr-2"
              aria-label="Actions"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {expanded && (
            <div className="mt-5 pt-5 border-t border-border/50 text-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              {why && (
                <div className="flex items-start gap-3 text-ink/80 bg-amber/5 p-4 rounded-2xl border border-amber/10">
                  <span className="font-serif italic font-medium leading-relaxed">"{why}"</span>
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-ink/60 font-medium">
                {cost && (
                  <div className="flex items-center gap-1.5">
                    <Wallet className="w-4 h-4" /> {cost}
                  </div>
                )}
                {activity?.place_details && (
                  <p className="w-full text-ink/70 leading-relaxed mt-1 text-base">{activity.place_details}</p>
                )}
              </div>

              {/* Action Bar (Progressively Revealed) */}
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-border/30">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-ink/60 hover:text-ink transition-colors font-medium text-xs">
                  <MapPin className="w-3.5 h-3.5" /> Map
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-ink/60 hover:text-ink transition-colors font-medium text-xs">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-amber/10 text-amber hover:text-amber transition-colors font-medium text-xs">
                  <Replace className="w-3.5 h-3.5" /> Alternatives
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 text-ink/60 hover:text-red-500 transition-colors font-medium text-xs ml-auto">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
