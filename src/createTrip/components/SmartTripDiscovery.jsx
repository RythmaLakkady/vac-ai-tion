import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Calendar, Users, Wallet, Navigation, MapPin } from 'lucide-react';
import { journeyIntelligence } from '@/service/journeyIntelligence';
import { format, differenceInDays } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function SmartTripDiscovery({ onDestinationSelected }) {
  const [phase, setPhase] = useState('INTENT'); // INTENT -> CLARIFY -> CANDIDATES
  const [intentText, setIntentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [extractedIntent, setExtractedIntent] = useState(null);
  
  // Clarification state
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [travelers, setTravelers] = useState('');
  const [budget, setBudget] = useState('');
  
  const [candidates, setCandidates] = useState([]);

  const handleIntentSubmit = async () => {
    if (!intentText.trim()) return setError("Please tell us what kind of trip you're imagining.");
    setError('');
    setLoading(true);
    
    // Extract structured intent
    const intent = await journeyIntelligence.extractDiscoveryIntent(intentText);
    setExtractedIntent(intent || { originalText: intentText });
    
    setLoading(false);
    setPhase('CLARIFY');
  };

  const handleClarifySubmit = async () => {
    if (!dateRange?.from || !dateRange?.to) return setError("Please select your travel dates.");
    if (!travelers) return setError("Please select how many people are travelling.");
    if (!budget) return setError("Please select your budget preference.");
    
    setError('');
    setLoading(true);
    
    try {
      const durationDays = differenceInDays(dateRange.to, dateRange.from) + 1;
      
      const results = await journeyIntelligence.discoverDestinations({
        discoveryIntent: extractedIntent,
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
        durationDays,
        travelers,
        budget
      });
      
      if (!results || results.length === 0) {
        throw new Error("No candidates returned");
      }
      
      setCandidates(results);
      setPhase('CANDIDATES');
    } catch (e) {
      console.error(e);
      setError("We couldn't find matching destinations right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = (candidate) => {
    onDestinationSelected({
      destination: candidate.destination_name + ", " + candidate.country,
      startDate: dateRange.from,
      endDate: dateRange.to,
      days: differenceInDays(dateRange.to, dateRange.from) + 1,
      travelers,
      budget,
      discoveryIntent: extractedIntent
    });
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      <AnimatePresence mode="wait">
        
        {/* PHASE 1: INTENT */}
        {phase === 'INTENT' && (
          <motion.div 
            key="intent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center justify-center space-y-8 py-10"
          >
            <div className="text-center space-y-4 max-w-lg">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-ink">Let's figure out your trip.</h2>
              <p className="text-lg text-gray-500 font-sans">Tell us what you're in the mood for. You don't need to know the destination yet.</p>
            </div>
            
            <div className="w-full max-w-2xl relative">
              <textarea
                value={intentText}
                onChange={(e) => setIntentText(e.target.value)}
                placeholder="e.g. I want somewhere warm and cheap with beaches."
                className="w-full h-40 p-6 text-xl rounded-[2rem] border-2 border-gray-200 focus:border-coral focus:ring-4 focus:ring-coral/10 transition-all resize-none shadow-sm placeholder:text-gray-300 font-sans"
              />
              <button 
                onClick={handleIntentSubmit}
                disabled={loading}
                className="absolute bottom-6 right-6 bg-ink text-white px-6 py-3 rounded-full font-bold hover:bg-black transition-transform hover:scale-105 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? 'Thinking...' : 'Find Destinations'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            {error && <p className="text-red-500 font-bold">{error}</p>}
            
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {['Romantic beach getaway', 'Peaceful mountains and cafés', 'Fun with nightlife'].map(chip => (
                <button 
                  key={chip} 
                  onClick={() => setIntentText(chip)}
                  className="px-4 py-2 bg-gray-50 hover:bg-coral/10 text-gray-600 hover:text-coral rounded-full text-sm font-medium transition-colors border border-gray-100"
                >
                  {chip}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* PHASE 2: CLARIFY */}
        {phase === 'CLARIFY' && (
          <motion.div 
            key="clarify"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col space-y-10"
          >
            <div>
              <h2 className="text-3xl font-serif font-bold text-ink mb-2">Nice. A couple of things will help narrow it down.</h2>
              <p className="text-gray-500">We've noted your preferences. Tell us about the logistics.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Calendar Section */}
              <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-4 w-full justify-start text-ink font-bold">
                  <Calendar className="w-5 h-5 text-coral" />
                  <h3>When are you travelling?</h3>
                </div>
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  disabled={{ before: new Date() }}
                  className="font-sans"
                  modifiersClassNames={{
                    selected: 'bg-coral text-white',
                    range_start: 'bg-coral text-white rounded-l-full',
                    range_end: 'bg-coral text-white rounded-r-full',
                    range_middle: 'bg-coral/20 text-ink'
                  }}
                />
                <div className="mt-4 text-sm font-medium text-gray-500">
                  {dateRange?.from && dateRange?.to ? (
                    <span>{format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')} ({differenceInDays(dateRange.to, dateRange.from) + 1} days)</span>
                  ) : (
                    <span>Select a date range</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-8">
                {/* Travelers Section */}
                <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4 text-ink font-bold">
                    <Users className="w-5 h-5 text-amber" />
                    <h3>Who is travelling?</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {['Just me', 'A Couple', 'Family', 'Friends'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setTravelers(t)}
                        className={`px-5 py-3 rounded-xl font-bold text-sm transition-colors ${travelers === t ? 'bg-amber/20 text-amber border-2 border-amber' : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-amber/50'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Budget Section */}
                <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4 text-ink font-bold">
                    <Wallet className="w-5 h-5 text-emerald-500" />
                    <h3>What's your rough budget?</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {['Budget', 'Moderate', 'Luxury'].map(b => (
                      <button 
                        key={b}
                        onClick={() => setBudget(b)}
                        className={`px-5 py-3 rounded-xl font-bold text-sm transition-colors ${budget === b ? 'bg-emerald-500/20 text-emerald-600 border-2 border-emerald-500' : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-emerald-500/50'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {error && <p className="text-red-500 font-bold text-center">{error}</p>}
            
            <div className="flex justify-between items-center mt-6">
              <button onClick={() => setPhase('INTENT')} className="text-gray-500 font-bold hover:text-ink">Back</button>
              <button 
                onClick={handleClarifySubmit}
                disabled={loading}
                className="bg-ink text-white px-8 py-4 rounded-full font-bold hover:bg-black transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? 'Finding Destinations...' : 'Show Me Options'} <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* PHASE 3: CANDIDATES */}
        {phase === 'CANDIDATES' && (
          <motion.div 
            key="candidates"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col space-y-8 w-full"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-serif font-bold text-ink">Here is what we found.</h2>
                <p className="text-gray-500">Based on your mood, dates, and budget.</p>
              </div>
              <button onClick={() => setPhase('CLARIFY')} className="text-sm font-bold text-gray-500 hover:text-ink">Adjust Search</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {candidates.map((c, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group h-full">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-black text-ink">{c.destination_name}</h3>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{c.country}</p>
                      </div>
                      <div className="bg-coral/10 p-2 rounded-full text-coral">
                        <MapPin className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <p className="text-lg font-medium text-ink mb-2">"{c.match_explanation}"</p>
                    <p className="text-gray-600 mb-6">{c.why_it_fits}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="w-20 font-bold text-gray-400 uppercase text-xs">Climate</span>
                        <span className="font-medium text-ink bg-gray-50 px-3 py-1 rounded-lg">{c.climate}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="w-20 font-bold text-gray-400 uppercase text-xs">Budget</span>
                        <span className="font-medium text-ink bg-gray-50 px-3 py-1 rounded-lg">{c.budget_positioning}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="w-20 font-bold text-gray-400 uppercase text-xs">Vibe</span>
                        <span className="font-medium text-ink bg-gray-50 px-3 py-1 rounded-lg">{c.trip_characteristics}</span>
                      </div>
                      {c.caveat && (
                        <div className="mt-4 p-3 bg-amber/10 border border-amber/20 rounded-xl">
                          <p className="text-xs font-bold text-amber-700">💡 Good to know: {c.caveat}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleSelectCandidate(c)}
                    className="w-full py-4 bg-gray-50 group-hover:bg-coral group-hover:text-white text-ink rounded-2xl font-bold transition-all flex justify-center items-center gap-2"
                  >
                    Choose {c.destination_name} <Navigation className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
