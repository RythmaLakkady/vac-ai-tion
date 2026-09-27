import React from 'react';
import JourneyStop from './JourneyStop';
import JourneyTransition from './JourneyTransition';

export default function JourneyChapter({ day, dayIndex }) {
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

      <div className="relative ml-2 sm:ml-4">
        {/* Subtle vertical line connecting the entire day */}
        <div className="absolute top-4 bottom-0 left-[7px] w-[2px] bg-border/40 -z-10 hidden sm:block"></div>
        
        {day.activities.map((activity, idx) => {
          const isLast = idx === day.activities.length - 1;
          const nextActivity = !isLast ? day.activities[idx + 1] : null;

          return (
            <React.Fragment key={`day-${dayIndex}-stop-${idx}`}>
              <JourneyStop activity={activity} dayIndex={dayIndex} activityIndex={idx} />
              {!isLast && (
                <JourneyTransition fromStop={activity} toStop={nextActivity} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
