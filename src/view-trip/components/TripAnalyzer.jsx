import React, { useMemo } from 'react';
import { feasibilityEngine } from '../../service/feasibilityEngine';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function TripAnalyzer({ trip, itinerary }) {
  const analysis = useMemo(() => {
    return feasibilityEngine.getItineraryScore(itinerary);
  }, [itinerary]);

  if (!analysis || analysis.status === 'unavailable') {
    return (
      <div className="p-10 text-center text-gray-500 bg-card rounded-3xl border border-border">
        <h3 className="text-xl font-bold mb-2">Score unavailable</h3>
        <p>Not enough itinerary information to analyze this trip.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-border mb-8">
        <h2 className="text-2xl font-black font-serif text-ink uppercase mb-6 flex items-center gap-3">
          Itinerary Score
          <span className={`px-4 py-1 rounded-full text-lg ${
            analysis.score >= 80 ? 'bg-green-100 text-green-700' :
            analysis.score >= 60 ? 'bg-amber/10 text-amber' :
            'bg-red-100 text-red-600'
          }`}>
            {analysis.score} / 100
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Strengths */}
          <div>
            <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Strengths
            </h3>
            {analysis.strengths.length > 0 ? (
              <ul className="space-y-3">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-ink/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                    {s}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink/40 text-sm italic">No specific strengths identified.</p>
            )}
          </div>

          {/* Needs Attention */}
          <div>
            <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber" />
              Needs attention
            </h3>
            {analysis.warnings.length > 0 ? (
              <ul className="space-y-3">
                {analysis.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-ink/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber mt-2 shrink-0"></div>
                    {w}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink/40 text-sm italic">This itinerary looks great! No major issues detected.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Missing dimensions section */}
      <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          How is this calculated?
        </h4>
        <p className="text-sm text-blue-700/80 leading-relaxed">
          The Itinerary Score evaluates your trip deterministically across measurable dimensions like geographic efficiency (avoiding long transit back-and-forth) and time feasibility (preventing 10+ hour marathon days). It does not use AI guesswork for timing. Add or remove stops to see how it affects your score.
        </p>
      </div>
    </div>
  );
}
