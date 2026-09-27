import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import JourneyStop from './JourneyStop';
import JourneyTransition from './JourneyTransition';

export default function JourneyChapter({ day, dayIndex, onDeleteStop, onAddStop, onEditStop, onInsertStop, onReplaceStop, onSelectStop, selectedStopId }) {
  if (!day || !day.activities || day.activities.length === 0) return null;

  return (
    <div className="relative mb-16 last:mb-0 pt-8 font-sans">
      <div className="mb-10">
        <h2 className="text-sm font-bold text-amber uppercase tracking-widest mb-2">Day {(dayIndex + 1).toString().padStart(2, '0')}</h2>
        <h3 className="text-3xl font-bold font-serif text-ink">{day.theme || `Exploring Day ${dayIndex + 1}`}</h3>
        {day.daily_brief && (
          <p className="text-ink/60 mt-3 text-lg leading-relaxed max-w-2xl">{day.daily_brief}</p>
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
                    previousActivity={idx > 0 ? day.activities[idx - 1] : null}
                    nextActivity={nextActivity}
                  />
                  {!isLast && (
                    <JourneyTransition fromStop={activity} toStop={nextActivity} />
                  )}
                </React.Fragment>
              );
            })}
            {provided.placeholder}
            
            <div className="mt-6 flex items-center justify-center">
              <button 
                onClick={() => onAddStop(dayIndex)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-border/60 text-ink/50 hover:bg-gray-50 hover:text-ink/80 hover:border-border transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add Stop
              </button>
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}
