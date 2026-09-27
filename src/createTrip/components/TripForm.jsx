import { motion } from "framer-motion";
import { PlaneTakeoff, MapPin, Calendar, Users, Wallet, Compass, Sparkles } from "lucide-react";
import { SelectBudgetOptions, SelectTravelersList, SelectTravelStyleList } from "@/constants/options";

export default function TripForm({
  step,
  formData,
  setFormData,
  startQuery,
  handleStartSearch,
  startResults,
  setStartResults,
  setSelectedStartPlace,
  setStartQuery,
  query,
  handleSearch,
  results,
  setResults,
  setSelectedPlace,
  setQuery,
  customCurrency,
  setCustomCurrency
}) {
  switch(step) {
    case 1:
      return (
        <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-10">
          <div>
            <div className="flex items-center gap-3 text-ink mb-2">
              <div className="p-3 bg-amber/10 rounded-full"><PlaneTakeoff className="w-6 h-6 text-amber" /></div>
              <h2 className="text-4xl font-serif font-bold">Where are you starting from?</h2>
            </div>
            <div className="relative">
              <input
                type="text"
                value={startQuery}
                onChange={handleStartSearch}
                placeholder="e.g. New York, USA"
                className="w-full text-2xl font-sans bg-transparent border-b-2 border-gray-300 pb-4 focus:outline-none focus:border-amber transition-colors"
                autoFocus
              />
              {startResults.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-card/90 backdrop-blur-xl border border-amber/20 rounded-2xl mt-2 shadow-2xl overflow-hidden z-50">
                  {startResults.map((place, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setSelectedStartPlace(place);
                        setStartQuery(place.display_name);
                        setFormData((prev) => ({ ...prev, startLocation: place.display_name }));
                        if (setStartResults) setStartResults([]);
                      }}
                      className="p-4 cursor-pointer hover:bg-amber/10 flex items-center gap-3 transition-colors text-ink font-sans"
                    >
                      <PlaneTakeoff className="w-4 h-4 text-amber" /> {place.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 text-ink mb-2">
              <div className="p-3 bg-amber/10 rounded-full"><MapPin className="w-6 h-6 text-amber" /></div>
              <h2 className="text-4xl font-serif font-bold">Where to?</h2>
            </div>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="e.g. Kyoto, Japan"
                className="w-full text-2xl font-sans bg-transparent border-b-2 border-gray-300 pb-4 focus:outline-none focus:border-amber transition-colors"
              />
              {results.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-card/90 backdrop-blur-xl border border-amber/20 rounded-2xl mt-2 shadow-2xl overflow-hidden z-50">
                  {results.map((place, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setSelectedPlace(place);
                        setQuery(place.display_name);
                        setFormData((prev) => ({ ...prev, destination: place.display_name }));
                        if (setResults) setResults([]);
                      }}
                      className="p-4 cursor-pointer hover:bg-amber/10 flex items-center gap-3 transition-colors text-ink font-sans"
                    >
                      <MapPin className="w-4 h-4 text-amber" /> {place.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      );
    case 2:
      return (
        <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-10">
          <div>
            <div className="flex items-center gap-3 text-ink mb-2">
              <div className="p-3 bg-coral/10 rounded-full"><Calendar className="w-6 h-6 text-coral" /></div>
              <h2 className="text-4xl font-serif font-bold">When are you going?</h2>
            </div>
            <input
              type="text"
              value={formData.season}
              onChange={(e) => setFormData(prev => ({ ...prev, season: e.target.value }))}
              placeholder="e.g. Next Summer, Specific Dates, or 'Not sure'"
              className="w-full text-3xl font-sans font-light bg-transparent border-b-2 border-gray-300 pb-4 focus:outline-none focus:border-coral transition-colors"
              autoFocus
            />
          </div>
          
          <div>
            <div className="flex items-center gap-3 text-ink mb-2">
              <h2 className="text-4xl font-serif font-bold">How many days?</h2>
            </div>
            <input
              type="number"
              min="1"
              max="15"
              value={formData.days}
              onChange={(e) => {
                let val = e.target.value.replace(/[^0-9]/g, '');
                if (parseInt(val) > 15) val = "15";
                setFormData(prev => ({ ...prev, days: val }));
              }}
              placeholder="e.g. 5"
              className="w-full text-4xl font-sans font-light bg-transparent border-b-2 border-gray-300 pb-4 focus:outline-none focus:border-coral transition-colors"
            />
          </div>
        </motion.div>
      );
    case 3:
      return (
        <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
          <div className="flex items-center gap-3 text-ink mb-6">
            <div className="p-3 bg-amber/10 rounded-full"><Users className="w-6 h-6 text-amber" /></div>
            <h2 className="text-4xl font-serif font-bold">Who's traveling?</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {SelectTravelersList.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData(prev => ({ ...prev, travelers: item.title, people: item.people }))}
                className={`p-6 cursor-pointer rounded-3xl border-2 transition-all ${formData.travelers === item.title ? "border-amber bg-amber/5" : "border-gray-200 hover:border-amber/50"}`}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-xl font-sans text-ink">{item.title}</h3>
                <p className="text-ink/60 text-sm mt-1 font-sans">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          {['Friends', 'Family'].includes(formData.travelers) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 border-t border-border/50">
              <label className="text-sm font-bold text-ink uppercase tracking-wider">Exactly how many people?</label>
              <input 
                type="number" 
                min="1"
                value={formData.people === "5-10 people" || formData.people === "3-5 people" ? "" : formData.people} 
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9]/g, '');
                  if (val !== "" && parseInt(val) < 1) val = "1";
                  setFormData(prev => ({ ...prev, people: val }));
                }}
                className="w-full mt-4 text-3xl font-sans font-light bg-transparent border-b-2 border-gray-300 pb-3 focus:outline-none focus:border-amber transition-colors"
                placeholder="e.g. 6"
                autoFocus
              />
            </motion.div>
          )}
        </motion.div>
      );
    case 4:
      return (
        <motion.div key="step4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
          <div className="flex items-center gap-3 text-ink mb-6">
            <div className="p-3 bg-coral/10 rounded-full"><Wallet className="w-6 h-6 text-coral" /></div>
            <h2 className="text-4xl font-serif font-bold">What's your budget?</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {SelectBudgetOptions.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData(prev => ({ ...prev, budget: item.title }))}
                className={`p-6 cursor-pointer rounded-3xl border-2 flex items-center gap-6 transition-all ${formData.budget === item.title ? "border-coral bg-coral/5" : "border-gray-200 hover:border-coral/50"}`}
              >
                <div className="text-5xl">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-xl font-sans text-ink">{item.title}</h3>
                  <p className="text-ink/60 text-sm mt-1 font-sans">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="pt-6 border-t border-border/50">
            <label className="text-sm font-bold text-ink uppercase tracking-wider mb-2 block">Or enter a custom budget:</label>
            <div className="flex gap-4 items-end">
              <select
                value={customCurrency}
                onChange={(e) => {
                  const newCurrency = e.target.value;
                  setCustomCurrency(newCurrency);
                  const currentVal = SelectBudgetOptions.some(opt => opt.title === formData.budget) ? "" : formData.budget.replace(/[^0-9.]/g, '');
                  if (currentVal) {
                    setFormData(prev => ({ ...prev, budget: `${newCurrency} ${currentVal}` }));
                  }
                }}
                className="text-2xl font-sans font-bold bg-transparent border-b-2 border-gray-300 pb-3 focus:outline-none focus:border-coral transition-colors cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="AUD">AUD ($)</option>
                <option value="CAD">CAD ($)</option>
              </select>
              <input 
                type="number" 
                value={SelectBudgetOptions.some(opt => opt.title === formData.budget) ? "" : formData.budget.replace(/[^0-9.]/g, '')} 
                onChange={(e) => setFormData(prev => ({ ...prev, budget: `${customCurrency} ${e.target.value}` }))}
                placeholder="e.g. 5000"
                className="w-full text-3xl font-sans font-light bg-transparent border-b-2 border-gray-300 pb-3 focus:outline-none focus:border-coral transition-colors"
              />
            </div>
          </div>
        </motion.div>
      );
    case 5:
      return (
        <motion.div key="step5" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-3 text-ink">
              <div className="p-3 bg-amber/10 rounded-full"><Compass className="w-6 h-6 text-amber" /></div>
              <h2 className="text-4xl font-serif font-bold">What's your travel style?</h2>
            </div>
            <p className="text-gray-500 font-sans text-lg mt-2">Select all that apply for your trip.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
            {SelectTravelStyleList.map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFormData(prev => {
                  const current = prev.travelStyle || [];
                  if (current.includes(item.title)) {
                    return { ...prev, travelStyle: current.filter(i => i !== item.title) };
                  }
                  return { ...prev, travelStyle: [...current, item.title] };
                })}
                className={`p-6 cursor-pointer rounded-3xl border-2 transition-all ${formData.travelStyle?.includes(item.title) ? "border-amber bg-amber/5 shadow-md shadow-amber/10" : "border-gray-200 hover:border-amber/50"}`}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-xl font-sans text-ink">{item.title}</h3>
                <p className="text-ink/60 text-sm mt-1 font-sans">{item.desc}</p>
              </motion.div>
            ))}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormData(prev => {
                const current = prev.travelStyle || [];
                return current.includes('Other') 
                  ? { ...prev, travelStyle: current.filter(i => i !== 'Other') }
                  : { ...prev, travelStyle: [...current, 'Other'] };
              })}
              className={`p-6 cursor-pointer rounded-3xl border-2 transition-all ${formData.travelStyle?.includes('Other') ? "border-amber bg-amber/5 shadow-md shadow-amber/10" : "border-gray-200 hover:border-amber/50"}`}
            >
              <div className="text-4xl mb-4">✨</div>
              <h3 className="font-bold text-xl font-sans text-ink">Other</h3>
              <p className="text-ink/60 text-sm mt-1 font-sans">Have a specific style in mind?</p>
              {formData.travelStyle?.includes('Other') && (
                <input
                  type="text"
                  value={formData.customTravelStyleText || ""}
                  onChange={(e) => {
                    e.stopPropagation();
                    setFormData(prev => ({ ...prev, customTravelStyleText: e.target.value }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Type here..."
                  className="w-full mt-4 bg-transparent border-b-2 border-amber pb-2 focus:outline-none text-lg font-sans"
                  autoFocus
                />
              )}
            </motion.div>
          </div>
        </motion.div>
      );
    case 6:
      return (
        <motion.div key="step6" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-3 text-ink">
              <div className="p-3 bg-coral/10 rounded-full"><Compass className="w-6 h-6 text-coral" /></div>
              <h2 className="text-4xl font-serif font-bold">Any food preferences?</h2>
            </div>
            <p className="text-gray-500 font-sans text-lg mt-2">Select all that apply.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {['No Restrictions', 'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free'].map((pref, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData(prev => {
                  const current = prev.foodPreferences || [];
                  if (pref === 'No Restrictions') {
                     return { ...prev, foodPreferences: ['No Restrictions'] };
                  }
                  let updated = current.includes(pref) ? current.filter(i => i !== pref) : [...current, pref];
                  updated = updated.filter(i => i !== 'No Restrictions');
                  if (updated.length === 0) updated = ['No Restrictions'];
                  return { ...prev, foodPreferences: updated };
                })}
                className={`p-6 cursor-pointer rounded-3xl border-2 text-center transition-all ${formData.foodPreferences?.includes(pref) ? "border-coral bg-coral/5 shadow-md shadow-coral/10" : "border-gray-200 hover:border-coral/50"}`}
              >
                <h3 className="font-bold text-xl text-ink text-center">{pref}</h3>
              </motion.div>
            ))}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFormData(prev => {
                const current = prev.foodPreferences || [];
                let updated = current.includes('Other') ? current.filter(i => i !== 'Other') : [...current, 'Other'];
                updated = updated.filter(i => i !== 'No Restrictions');
                return { ...prev, foodPreferences: updated };
              })}
              className={`p-6 cursor-pointer rounded-3xl border-2 transition-all ${formData.foodPreferences?.includes('Other') ? "border-coral bg-coral/5 shadow-md shadow-coral/10" : "border-gray-200 hover:border-coral/50"}`}
            >
              <h3 className="font-bold text-xl text-ink text-center mb-2">Other</h3>
              {formData.foodPreferences?.includes('Other') && (
                <input
                  type="text"
                  value={formData.customFoodPreferenceText || ""}
                  onChange={(e) => {
                    e.stopPropagation();
                    setFormData(prev => ({ ...prev, customFoodPreferenceText: e.target.value }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="e.g. Carnivore, Nut Allergy"
                  className="w-full mt-2 bg-transparent border-b-2 border-coral pb-1 focus:outline-none text-base font-sans"
                  autoFocus
                />
              )}
            </motion.div>
          </div>
        </motion.div>
      );
    case 7:
      return (
        <motion.div key="step7" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-3 text-ink">
              <div className="p-3 bg-indigo-500/10 rounded-full"><PlaneTakeoff className="w-6 h-6 text-indigo-500" /></div>
              <h2 className="text-4xl font-serif font-bold">Have you booked anything yet?</h2>
            </div>
            <p className="text-gray-500 font-sans text-lg mt-2">If you already have your flights or hotel, paste the details below so we don't generate new ones.</p>
          </div>
          
          <div className="space-y-6 pt-4">
            <div className="bg-white/50 border border-gray-200 rounded-3xl p-6 transition-all hover:border-indigo-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl text-ink flex items-center gap-2"><PlaneTakeoff className="w-5 h-5 text-indigo-500" /> My Flights</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.prebookedFlights !== ""} onChange={(e) => setFormData(prev => ({ ...prev, prebookedFlights: e.target.checked ? "I have booked my flights." : "" }))} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
              {formData.prebookedFlights !== "" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                  <textarea 
                    value={formData.prebookedFlights === "I have booked my flights." ? "" : formData.prebookedFlights}
                    onChange={(e) => setFormData(prev => ({ ...prev, prebookedFlights: e.target.value }))}
                    placeholder="Paste your flight numbers, departure times, and terminal details here..."
                    className="w-full bg-transparent border-2 border-indigo-100 rounded-2xl p-4 min-h-[100px] focus:outline-none focus:border-indigo-500 font-sans text-sm resize-none transition-colors"
                  />
                </motion.div>
              )}
            </div>

            <div className="bg-white/50 border border-gray-200 rounded-3xl p-6 transition-all hover:border-indigo-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl text-ink flex items-center gap-2"><Compass className="w-5 h-5 text-indigo-500" /> My Hotel</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.prebookedHotels !== ""} onChange={(e) => setFormData(prev => ({ ...prev, prebookedHotels: e.target.checked ? "I have booked my hotel." : "" }))} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
              {formData.prebookedHotels !== "" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                  <textarea 
                    value={formData.prebookedHotels === "I have booked my hotel." ? "" : formData.prebookedHotels}
                    onChange={(e) => setFormData(prev => ({ ...prev, prebookedHotels: e.target.value }))}
                    placeholder="Paste your hotel name, address, and check-in times here..."
                    className="w-full bg-transparent border-2 border-indigo-100 rounded-2xl p-4 min-h-[100px] focus:outline-none focus:border-indigo-500 font-sans text-sm resize-none transition-colors"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      );
    case 8:
      return (
        <motion.div key="step8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10 py-10">
          <div className="inline-flex justify-center items-center w-24 h-24 bg-gradient-to-tr from-amber to-coral rounded-full shadow-2xl mb-4 animate-bounce">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-5xl font-serif font-bold text-ink">Ready for magic?</h2>
          <p className="text-xl text-ink/80 max-w-md mx-auto font-sans leading-relaxed">
            Our Agent Swarm is standing by to craft the perfect itinerary for your {formData.days}-day trip to <span className="font-bold">{formData.destination}</span>.
          </p>
        </motion.div>
      );
    default: return null;
  }
}
