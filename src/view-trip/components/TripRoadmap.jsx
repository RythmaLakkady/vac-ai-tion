import { convertPrice } from '../../utils/currencyFormatter';
import { PlaneLanding, Hotel, Coffee, MapPin, Utensils, Ticket, Music, ShoppingBag, ArrowDown } from 'lucide-react';

const getIcon = (title, type) => {
  const t = (title + " " + (type || "")).toLowerCase();
  if (t.includes('flight') || t.includes('airport') || t.includes('arrival')) return PlaneLanding;
  if (t.includes('hotel') || t.includes('stay') || t.includes('check-in')) return Hotel;
  if (t.includes('breakfast') || t.includes('coffee') || t.includes('cafe')) return Coffee;
  if (t.includes('lunch') || t.includes('dinner') || t.includes('restaurant') || t.includes('food')) return Utensils;
  if (t.includes('museum') || t.includes('ticket') || t.includes('tour')) return Ticket;
  if (t.includes('club') || t.includes('bar') || t.includes('night') || t.includes('music')) return Music;
  if (t.includes('shop') || t.includes('mall') || t.includes('market')) return ShoppingBag;
  return MapPin;
};

export default function TripRoadmap({ itinerary, currency, exchangeRates }) {
  if (!itinerary || itinerary.length === 0) return <div className="p-10 text-center text-gray-500">No itinerary data.</div>;

  // Flatten the itinerary to a single sequence of events
  let globalSequence = [];
  itinerary.forEach((day, dayIdx) => {
    if (day.activities) {
      day.activities.forEach((act, actIdx) => {
        globalSequence.push({ ...act, dayIndex: dayIdx + 1, activityIndex: actIdx });
      });
    }
  });

  return (
    <div className="py-10 max-w-4xl mx-auto font-sans">
      <div className="flex flex-col items-center">
        <div className="px-6 py-2 bg-ink text-primary-foreground font-black tracking-widest rounded-full mb-6">
          START
        </div>
        
        <div className="relative border-l-4 border-amber ml-6 md:ml-0 md:left-1/2 w-full md:-translate-x-0.5 space-y-12">
          {globalSequence.map((item, idx) => {
            const Icon = getIcon(item.place_name, item.category);
            const isLeft = idx % 2 === 0;
            
            let pricing = item.ticket_pricing || "Included";
            if (pricing !== "N/A" && pricing.toLowerCase() !== "included" && pricing.toLowerCase() !== "free") {
              pricing = convertPrice(pricing, currency, exchangeRates) || pricing;
            }

            return (
              <div key={idx} className={`relative flex items-center justify-between md:justify-normal w-full ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                {/* Node icon */}
                <div className="absolute left-0 md:left-1/2 -translate-x-[22px] md:-translate-x-1/2 w-10 h-10 bg-amber text-primary-foreground rounded-full border-4 border-card shadow-lg flex items-center justify-center z-10">
                  <Icon className="w-4 h-4" />
                </div>
                
                {/* Mobile view padding */}
                <div className="md:hidden w-8"></div>

                {/* Content */}
                <div className={`w-full md:w-5/12 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12 text-left'} pl-12 md:pl-0`}>
                  <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow group">
                    <div className={`text-xs font-bold text-amber mb-2 uppercase tracking-wider ${isLeft ? 'md:justify-end' : ''} flex gap-2`}>
                      <span>Day {item.dayIndex}</span>
                      <span>•</span>
                      <span>{item.time_travel || "Anytime"}</span>
                    </div>
                    <h4 className="text-xl font-bold font-serif text-ink mb-1 group-hover:text-amber transition-colors">{item.place_name}</h4>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.place_details}</p>
                    
                    <div className={`flex flex-wrap gap-2 text-xs font-semibold ${isLeft ? 'md:justify-end' : ''}`}>
                      {pricing && pricing !== "N/A" && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{pricing}</span>
                      )}
                      {item.time_travel && item.time_travel !== "N/A" && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{item.time_travel}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Empty space for alternating flex layout */}
                <div className="hidden md:block w-5/12"></div>
              </div>
            );
          })}
        </div>
        
        <div className="px-6 py-2 bg-ink text-primary-foreground font-black tracking-widest rounded-full mt-12">
          FINISH
        </div>
      </div>
    </div>
  );
}
