import React, { useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, Wallet, AlertTriangle, Info } from 'lucide-react';
import JourneyStop from './JourneyStop';
import JourneyTransition from './JourneyTransition';
import { convertPrice } from '../../../utils/currencyFormatter';
import { feasibilityEngine } from '../../../service/feasibilityEngine';
import { analytics } from '../../../service/analyticsService';

export default function JourneyChapter({ trip, day, dayIndex, onDeleteStop, onAddStop, onEditStop, onInsertStop, onReplaceStop, onSelectStop, onExploreArea, selectedStopId, currency, exchangeRates, isReadOnly = false }) {
  if (!day || !day.activities || day.activities.length === 0) return null;

  const extractCost = (pricingStr, costState) => {
    if (!pricingStr || pricingStr === 'unknown' || pricingStr === 'N/A') return { amount: 0, state: 'unknown' };
    if (pricingStr.toLowerCase() === 'free') return { amount: 0, state: 'known' };
    const num = parseFloat(String(pricingStr).replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return { amount: 0, state: 'unknown' };
    return { amount: num, state: costState === 'known' ? 'known' : 'estimated' };
  };

  let dailyTotal = 0;
  let hasUnknown = false;
  let hasEstimated = false;

  day.activities.forEach(act => {
    const cost = extractCost(act.ticket_pricing, act.costState);
    dailyTotal += cost.amount;
    if (cost.state === 'unknown') hasUnknown = true;
    if (cost.state === 'estimated') hasEstimated = true;
  });

  const warnings = isReadOnly ? [] : feasibilityEngine.analyzeDay(day, dayIndex);
  
  useEffect(() => {
    if (warnings.length > 0) {
      warnings.forEach(warn => {
        analytics.trackEvent('journey_feasibility_viewed', { type: warn.type, severity: warn.severity, dayIndex });
      });
    }
  }, [warnings.length, dayIndex]);

  return (
    <div className="relative mb-16 last:mb-0 pt-8 font-sans">
      <div className="mb-10">
        <h2 className="text-sm font-bold text-amber uppercase tracking-widest mb-2">Day {(dayIndex + 1).toString().padStart(2, '0')}</h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <h3 className="text-3xl font-bold font-serif text-ink">{day.theme || `Exploring Day ${dayIndex + 1}`}</h3>
          
          {/* Daily Budget Pill */}
          <div className="flex items-center gap-2 bg-gray-50 border border-border px-4 py-2 rounded-xl shrink-0">
            <Wallet className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-ink">
              {convertPrice('$' + dailyTotal.toFixed(0), currency, exchangeRates)}
            </span>
            {(hasUnknown || hasEstimated) && (
               <span className="text-[10px] font-bold uppercase bg-gray-200 text-gray-600 px-1.5 rounded" title={hasUnknown ? "Contains unknown costs" : "Contains estimated costs"}>
                 {hasUnknown ? 'Est+' : 'Est'}
               </span>
            )}
          </div>
        </div>
        {day.daily_brief && (
          <p className="text-ink/60 mt-3 text-lg leading-relaxed max-w-2xl">{day.daily_brief}</p>
        )}
        
        {warnings.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {warnings.map((warn, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${warn.severity === 'warning' ? 'bg-amber/5 border-amber/20 text-amber' : 'bg-blue-50/50 border-blue-100 text-blue-700'}`}>
                {warn.severity === 'warning' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <Info className="w-5 h-5 shrink-0" />}
                <div className="text-sm">
                  <span className="font-bold">{warn.title}: </span>
                  <span className="opacity-90">{warn.explanation}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Droppable droppableId={`day-${dayIndex}`} type="activity">
        {(provided) => (
          <div 
            className="relative ml-2 sm:ml-4"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {/* Subtle vertical line connecting the entire day */}
            <div className="absolute top-4 bottom-0 left-[7px] w-[2px] bg-border/40 -z-10 hidden sm:block"></div>
            
            {day.activities.map((activity, idx) => {
              const isLast = idx === day.activities.length - 1;
              const nextActivity = !isLast ? day.activities[idx + 1] : null;

              return (
                <React.Fragment key={`day-${dayIndex}-stop-${idx}`}>
                  <JourneyStop 
                    trip={trip}
                    activity={activity} 
                    dayIndex={dayIndex} 
                    activityIndex={idx}
                    id={`day-${dayIndex}-stop-${idx}`}
                    isSelected={selectedStopId === `day-${dayIndex}-stop-${idx}`}
                    onDelete={() => onDeleteStop(dayIndex, idx)}
                    onEdit={(newData) => onEditStop(dayIndex, idx, newData)}
                    onInsert={(newData) => onInsertStop(dayIndex, idx, newData)}
                    onReplace={(newData) => onReplaceStop(dayIndex, idx, newData)}
                    onSelect={() => onSelectStop(`day-${dayIndex}-stop-${idx}`, dayIndex)}
                    onExploreArea={() => onExploreArea({
                      activity, dayIndex, activityIndex: idx, 
                      previousActivity: idx > 0 ? day.activities[idx - 1] : null,
                      nextActivity: !isLast ? day.activities[idx + 1] : null
                    })}
                    previousActivity={idx > 0 ? day.activities[idx - 1] : null}
                    nextActivity={nextActivity}
                    currency={currency}
                    exchangeRates={exchangeRates}
                    isReadOnly={isReadOnly}
                  />
                  {!isLast && (
                    <JourneyTransition fromStop={activity} toStop={nextActivity} />
                  )}
                </React.Fragment>
              );
            })}
            {provided.placeholder}
            
            {!isReadOnly && (
              <div className="mt-6 flex items-center justify-center">
                <button 
                  onClick={() => onAddStop(dayIndex)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-border/60 text-ink/50 hover:bg-gray-50 hover:text-ink/80 hover:border-border transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Stop
                </button>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
