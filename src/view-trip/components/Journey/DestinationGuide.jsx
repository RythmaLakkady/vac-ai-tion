import React, { useState, useEffect } from 'react';
import { X, MapPin, ExternalLink, Info, Compass, AlertCircle, ArrowLeft } from 'lucide-react';
import { analytics } from '@/service/analyticsService';
import { journeyIntelligence } from '@/service/journeyIntelligence';

export default function DestinationGuide({ trip, contextualStop, onClose, onAddStop }) {
  const [loading, setLoading] = useState(true);
  const [guideData, setGuideData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    async function loadGuide() {
      if (!contextualStop) return;
      
      setLoading(true);
      setError(null);
      analytics.trackEvent('destination_guide_opened', { 
        placeName: contextualStop.activity.place_name,
        location: contextualStop.activity.location 
      });

      try {
        const data = await journeyIntelligence.getDestinationContext({
          location: contextualStop.activity.location || contextualStop.activity.place_name,
          currentStop: contextualStop.activity,
          previousStop: contextualStop.previousActivity,
          nextStop: contextualStop.nextActivity,
          budget: trip?.tripData?.budget,
          traveler: trip?.tripData?.traveler
        });
        
        if (isMounted) setGuideData(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadGuide();
    return () => { isMounted = false; };
  }, [contextualStop, trip]);

  const handleExternalLink = (url, title) => {
    analytics.trackEvent('destination_guide_resource_clicked', {
      url,
      title,
      source: contextualStop.activity.place_name
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!contextualStop) return null;

  const { activity, dayIndex } = contextualStop;

  return (
    <div className="bg-card min-h-[600px] h-full rounded-[2rem] border border-border shadow-xl flex flex-col relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header */}
      <div className="p-6 pb-4 border-b border-border/50 flex items-center justify-between sticky top-0 bg-card/90 backdrop-blur-md z-10">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-ink transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Journey
        </button>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-ink">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar pb-24">
        
        {/* Title Section */}
        <div className="mb-10">
          <span className="text-sm font-bold text-amber uppercase tracking-widest mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Destination Guide
          </span>
          <h2 className="text-4xl font-bold font-serif text-ink mb-4 leading-tight">
            Explore {activity.location || activity.place_name}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span>Contextual to Day {dayIndex + 1}</span>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span>{activity.place_name}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Compass className="w-8 h-8 text-amber animate-spin-slow mb-4" />
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Generating context...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-8 h-8 mb-3 opacity-50" />
            <p className="font-semibold mb-1">Guide Unavailable</p>
            <p className="text-sm opacity-80">{error}</p>
            <button onClick={() => setGuideData(null) || setLoading(true)} className="mt-4 text-sm font-bold underline hover:no-underline">Try again</button>
          </div>
        ) : guideData ? (
          <div className="space-y-10 animate-in fade-in duration-500">
            
            {/* Overview */}
            <section>
              <p className="text-xl text-ink/80 leading-relaxed font-serif">
                {guideData.overview}
              </p>
            </section>

            {/* Why You're Here */}
            <section className="bg-amber/5 border border-amber/10 p-6 rounded-3xl">
              <h3 className="text-sm font-bold text-amber uppercase tracking-widest mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" /> Why you're here
              </h3>
              <p className="text-ink/80 font-medium leading-relaxed">
                {guideData.why_here}
              </p>
            </section>

            {/* Journey Impact */}
            {guideData.journey_impact && guideData.journey_impact.length > 0 && (
              <section className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">
                  Journey Impact
                </h3>
                <ul className="space-y-3">
                  {guideData.journey_impact.map((impact, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-blue-900/80 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      {impact}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Know Before You Go */}
            {guideData.know_before_you_go && guideData.know_before_you_go.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold font-serif text-ink mb-6">Know Before You Go</h3>
                <div className="grid gap-3">
                  {guideData.know_before_you_go.map((tip, idx) => (
                    <div key={idx} className="bg-gray-50 border border-border p-4 rounded-xl flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-xs font-bold text-gray-400">{idx + 1}</div>
                      <p className="text-sm text-ink/70 leading-relaxed font-medium">{tip}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Useful Resources */}
            {guideData.useful_resources && guideData.useful_resources.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold font-serif text-ink mb-6">Useful Resources</h3>
                <div className="grid gap-3">
                  {guideData.useful_resources.map((res, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleExternalLink(res.url, res.title)}
                      className="w-full text-left bg-white border border-border hover:border-amber hover:shadow-md p-4 rounded-xl flex items-center justify-between group transition-all"
                    >
                      <div>
                        <h4 className="font-bold text-ink text-sm mb-1">{res.title}</h4>
                        <p className="text-xs text-gray-500">{res.reason}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-amber transition-colors" />
                    </button>
                  ))}
                </div>
              </section>
            )}

          </div>
        ) : null}
      </div>
    </div>
  );
}
