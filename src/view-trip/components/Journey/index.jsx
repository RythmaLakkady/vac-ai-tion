import React from 'react';
import JourneyIntro from './JourneyIntro';
import JourneyChapter from './JourneyChapter';

export default function Journey({ trip, itinerary }) {
  if (!trip && !itinerary) {
    // Loading State
    return (
      <div className="max-w-4xl mx-auto pb-24 animate-pulse">
        <div className="py-12 border-b border-border/50 mb-12">
          <div className="h-16 w-64 bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-6 w-48 bg-gray-100 rounded-md mb-4"></div>
          <div className="h-4 w-full max-w-md bg-gray-100 rounded-md"></div>
        </div>
        
        <div className="mb-16 pt-8">
          <div className="h-4 w-16 bg-amber/20 rounded-md mb-2"></div>
          <div className="h-10 w-48 bg-gray-200 rounded-xl mb-8"></div>
          
          <div className="flex items-start gap-6 mb-4">
            <div className="w-4 h-4 rounded-full bg-gray-200 shrink-0"></div>
            <div className="flex-1 h-24 bg-gray-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!itinerary || itinerary.length === 0) {
    // Empty State
    return (
      <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-gray-50">
        <p className="text-lg text-ink/50 font-medium">Your journey has no stops yet. Add an activity to begin.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <JourneyIntro trip={trip} />
      
      <div className="space-y-4">
        {itinerary.map((day, idx) => (
          <JourneyChapter key={`day-${idx}`} day={day} dayIndex={idx} />
        ))}
      </div>
      
      <div className="mt-16 pt-8 border-t border-border/50 text-center">
        <span className="text-sm font-bold tracking-widest text-ink/30 uppercase">End of Journey</span>
      </div>
    </div>
  );
}
