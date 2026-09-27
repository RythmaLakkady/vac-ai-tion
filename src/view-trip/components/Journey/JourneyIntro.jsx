import React from 'react';

export default function JourneyIntro({ trip }) {
  const tripData = trip?.tripData || {};
  const userSelection = trip?.userSelection || {};
  
  const destination = userSelection.destination || tripData.location || "Unknown Destination";
  const duration = userSelection.days || tripData.duration || "";
  const travelers = userSelection.travelers || tripData.travelers || "";
  
  return (
    <div className="py-12 border-b border-border/50 mb-12 font-sans">
      <h1 className="text-5xl sm:text-6xl font-black font-serif tracking-tight text-ink uppercase mb-6">
        {destination.split(',')[0]}
      </h1>
      
      <div className="text-xl text-ink/70 max-w-2xl leading-relaxed">
        <p className="font-medium">
          {duration} Days &middot; {travelers}
        </p>
        <p className="mt-4 text-ink/60 text-lg">
          A personalized journey through the best of {destination.split(',')[0]}. Follow the sequence below or adapt it as you go.
        </p>
      </div>
    </div>
  );
}
