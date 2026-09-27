import { convertPrice } from '../../utils/currencyFormatter';

export default function TripTimeline({ itinerary, currency, exchangeRates }) {
  if (!itinerary || itinerary.length === 0) return <div className="p-10 text-center text-gray-500">No itinerary data.</div>;

  let globalSequence = [];
  itinerary.forEach((day, dayIdx) => {
    if (day.activities) {
      day.activities.forEach((act, actIdx) => {
        globalSequence.push({ ...act, dayIndex: dayIdx + 1, activityIndex: actIdx });
      });
    }
  });

  return (
    <div className="py-10 max-w-3xl mx-auto font-sans">
      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        {globalSequence.map((item, idx) => {
          
          let pricing = item.ticket_pricing || "Included";
          if (pricing !== "N/A" && pricing.toLowerCase() !== "included" && pricing.toLowerCase() !== "free") {
            pricing = convertPrice(pricing, currency, exchangeRates) || pricing;
          }

          const isNewDay = idx === 0 || item.dayIndex !== globalSequence[idx-1].dayIndex;

          return (
            <div key={idx}>
              {isNewDay && (
                <div className="bg-gray-50 px-8 py-3 border-b border-t first:border-t-0 border-border">
                  <h3 className="font-bold text-amber tracking-wider uppercase text-sm">Day {item.dayIndex}</h3>
                </div>
              )}
              <div className="flex px-8 py-6 border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors group">
                <div className="w-32 shrink-0 pt-1 text-ink/60 font-medium text-sm">
                  {item.time_travel || "Anytime"}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-lg font-bold text-ink group-hover:text-amber transition-colors">{item.place_name}</h4>
                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md shrink-0 whitespace-nowrap">
                      {pricing}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1 mb-3">{item.place_details}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
