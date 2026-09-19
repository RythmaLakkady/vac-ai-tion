import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Navigation, CloudSun, BookHeart, Utensils, Smartphone, MessageCircle, CalendarClock, Ticket } from 'lucide-react';

function WandererNotes({ trip }) {
  const notes = trip?.tripData?.wanderer_notes;

  if (!notes) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
          <Lightbulb className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-serif text-indigo-950">Wanderer Notes</h2>
          <p className="text-indigo-900/60 font-sans">Essential tips for a seamless experience</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 font-sans">
        {notes.season_recommendations && (
          <div className="bg-card/60 p-6 rounded-3xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3 mb-3 text-indigo-900 font-bold text-lg">
              <CalendarClock className="text-indigo-500 w-5 h-5" /> Season & Dates
            </div>
            <p className="text-indigo-950/70 text-sm leading-relaxed">{notes.season_recommendations}</p>
          </div>
        )}
        {notes.getting_around && (
          <div className="bg-card/60 p-6 rounded-3xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3 mb-3 text-indigo-900 font-bold text-lg">
              <Navigation className="text-indigo-500 w-5 h-5" /> Getting Around
            </div>
            <p className="text-indigo-950/70 text-sm leading-relaxed">{notes.getting_around}</p>
          </div>
        )}
        
        {notes.weather_clothing_tips && (
          <div className="bg-card/60 p-6 rounded-3xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3 mb-3 text-indigo-900 font-bold text-lg">
              <CloudSun className="text-indigo-500 w-5 h-5" /> Weather & Clothing
            </div>
            <p className="text-indigo-950/70 text-sm leading-relaxed">{notes.weather_clothing_tips}</p>
          </div>
        )}

        {notes.cultural_etiquette && (
          <div className="bg-card/60 p-6 rounded-3xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3 mb-3 text-indigo-900 font-bold text-lg">
              <BookHeart className="text-indigo-500 w-5 h-5" /> Cultural Etiquette
            </div>
            <p className="text-indigo-950/70 text-sm leading-relaxed">{notes.cultural_etiquette}</p>
          </div>
        )}
      </div>

      {notes.native_food_options && notes.native_food_options.length > 0 && (
        <div className="mt-8 bg-card/60 p-6 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-indigo-900 font-bold text-lg">
            <Utensils className="text-indigo-500 w-5 h-5" /> Must-Try Local Foods
          </div>
          <div className="grid grid-cols-1 gap-4">
            {notes.native_food_options.map((food, idx) => (
              <div key={idx} className="bg-white/50 p-4 rounded-2xl border border-indigo-50">
                <h4 className="font-bold text-indigo-900 mb-1">{food.name}</h4>
                <p className="text-indigo-950/70 text-sm mb-2">{food.description}</p>
                <p className="text-indigo-600/80 text-xs font-semibold">📍 {food.where_to_find}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.local_events && notes.local_events.length > 0 && (
        <div className="mt-8 bg-card/60 p-6 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-indigo-900 font-bold text-lg">
            <Ticket className="text-indigo-500 w-5 h-5" /> Local Events & Festivals
          </div>
          <div className="grid grid-cols-1 gap-4">
            {notes.local_events.map((event, idx) => (
              <div key={idx} className="bg-white/50 p-4 rounded-2xl border border-indigo-50 flex flex-col h-full">
                <h4 className="font-bold text-indigo-900 mb-1">{event.event_name}</h4>
                <p className="text-indigo-950/70 text-sm mb-3 flex-grow">{event.description}</p>
                <div className="mt-auto space-y-2">
                  <p className="text-indigo-600/80 text-xs font-semibold">📅 {event.time_period}</p>
                  {event.booking_url && event.booking_url !== "" && (
                    <a href={event.booking_url} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-indigo-500 hover:text-indigo-700 font-medium underline underline-offset-2">
                      More Info / Tickets
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.recommended_apps && notes.recommended_apps.length > 0 && (
        <div className="mt-8 bg-card/60 p-6 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-indigo-900 font-bold text-lg">
            <Smartphone className="text-indigo-500 w-5 h-5" /> Recommended Apps
          </div>
          <div className="flex flex-col gap-4">
            {notes.recommended_apps.map((app, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-white/50 p-3 rounded-xl border border-indigo-50 min-w-[200px] flex-1">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-indigo-900 text-sm">{app.name}</h4>
                  <p className="text-indigo-950/70 text-xs">{app.purpose}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.tourist_tips && notes.tourist_tips.length > 0 && (
        <div className="mt-8 bg-card/60 p-6 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-indigo-900 font-bold text-lg">
            <MessageCircle className="text-indigo-500 w-5 h-5" /> Tips from Other Tourists
          </div>
          <ul className="list-disc pl-5 space-y-2 text-indigo-950/70 text-sm leading-relaxed">
            {notes.tourist_tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

export default WandererNotes;
