import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Navigation, CloudSun, BookHeart } from 'lucide-react';

function WandererNotes({ trip }) {
  const notes = trip?.tripData?.wanderer_notes;

  if (!notes) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-16 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 backdrop-blur-3xl p-8 sm:p-10 rounded-[40px] border border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
          <Lightbulb className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl font-bold font-serif text-indigo-950">Wanderer Notes</h2>
          <p className="text-indigo-900/60 font-sans">Essential tips for a seamless experience</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        {notes.getting_around && (
          <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3 mb-3 text-indigo-900 font-bold text-lg">
              <Navigation className="text-indigo-500 w-5 h-5" /> Getting Around
            </div>
            <p className="text-indigo-950/70 text-sm leading-relaxed">{notes.getting_around}</p>
          </div>
        )}
        
        {notes.weather_clothing_tips && (
          <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3 mb-3 text-indigo-900 font-bold text-lg">
              <CloudSun className="text-indigo-500 w-5 h-5" /> Weather & Clothing
            </div>
            <p className="text-indigo-950/70 text-sm leading-relaxed">{notes.weather_clothing_tips}</p>
          </div>
        )}

        {notes.cultural_etiquette && (
          <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
            <div className="flex items-center gap-3 mb-3 text-indigo-900 font-bold text-lg">
              <BookHeart className="text-indigo-500 w-5 h-5" /> Cultural Etiquette
            </div>
            <p className="text-indigo-950/70 text-sm leading-relaxed">{notes.cultural_etiquette}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default WandererNotes;
