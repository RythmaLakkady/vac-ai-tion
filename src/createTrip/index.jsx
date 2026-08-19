import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Users, Wallet, ChevronRight, ChevronLeft, Sparkles, PlaneTakeoff, Bot, Compass } from "lucide-react";
import { AI_PROMPT, SelectBudgetOptions, SelectTravelersList, SelectTravelStyleList } from "@/constants/options";
import { chatSession } from "@/service/AImodel";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import AuthModal from "@/components/ui/custom/AuthModal";
import AgentTerminal from "@/components/ui/custom/AgentTerminal";
import AgentOrbs from "@/components/ui/custom/AgentOrbs";
import TravelFactsCarousel from "@/components/ui/custom/TravelFactsCarousel";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const FUNCTION_URL = import.meta.env.VITE_PRICE_FUNCTION_URL || 
  (isLocal ? "http://127.0.0.1:8080" 
           : "https://us-central1-wandergen---ai-travel-planner.cloudfunctions.net/priceAggregator");

function CreateTrip() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    startLocation: "",
    destination: location.state?.destination || "",
    days: "",
    budget: "",
    travelers: "",
    people: "",
    travelStyle: [],
    foodPreferences: [],
    season: "",
    customTravelStyleText: "",
    customFoodPreferenceText: "",
  });
  
  // Search State
  const [query, setQuery] = useState(location.state?.destination || "");
  const [results, setResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [startQuery, setStartQuery] = useState("");
  const [startResults, setStartResults] = useState([]);
  const [selectedStartPlace, setSelectedStartPlace] = useState(null);
  
  // Agent State
  const [agentMode, setAgentMode] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [agentStatus, setAgentStatus] = useState("pending");
  const [jobId, setJobId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customCurrency, setCustomCurrency] = useState("USD");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (!user) {
        setIsModalOpen(true);
      } else {
        setIsModalOpen(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Agent listener
  useEffect(() => {
    if (!jobId) return;
    const unsubscribe = onSnapshot(doc(db, "agentJobs", jobId), (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      setAgentLogs(data.logs || []);
      setAgentStatus(data.status || "pending");
      if (data.status === "completed" && data.tripDocId) {
        setTimeout(() => navigate("/view-trip/" + data.tripDocId), 1500);
      }
      if (data.status === "failed") {
        setLoading(false);
        toast("Trip generation failed.");
      }
    });
    return () => unsubscribe();
  }, [jobId, navigate]);

  const handleStartSearch = async (e) => {
    const value = e.target.value;
    setStartQuery(value);
    if (value.length > 2) {
      try {
        const res = await fetch(`https://api.locationiq.com/v1/autocomplete.php?key=${import.meta.env.VITE__LOCATION_IQ_API_KEY}&q=${value}&limit=5&format=json`);
        const data = await res.json();
        setStartResults(data);
      } catch (error) {
        console.error("Autocomplete error:", error);
      }
    } else {
      setStartResults([]);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 2) {
      try {
        const res = await fetch(`https://api.locationiq.com/v1/autocomplete.php?key=${import.meta.env.VITE__LOCATION_IQ_API_KEY}&q=${value}&limit=5&format=json`);
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Autocomplete error:", error);
      }
    } else {
      setResults([]);
    }
  };

  const handleNext = () => {
    if (step === 1 && (!formData.startLocation || !formData.destination)) return toast("Please enter both your origin and destination.");
    if (step === 2 && (!formData.days || formData.days > 15 || formData.days < 1)) return toast("Please enter valid days (1 to 15).");
    if (step === 3) {
      if (!formData.travelers) return toast("Please select your travel companions.");
      if (['Friends', 'Family'].includes(formData.travelers) && (!formData.people || isNaN(formData.people))) {
        return toast("Please enter a valid number of people.");
      }
    }
    if (step === 4 && !formData.budget) return toast("Please select or enter a budget.");
    if (step === 5 && (!formData.travelStyle || formData.travelStyle.length === 0)) return toast("Please select at least one travel style.");
    if (step === 6 && (!formData.foodPreferences || formData.foodPreferences.length === 0)) return toast("Please select your food preferences.");
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const onGenerateWithAgents = async () => {
    if (!isLoggedIn) return setIsModalOpen(true);
    setLoading(true);
    setAgentMode(true);
    try {
      const user = auth.currentUser;
      
      let userNotes = [];
      if (user?.uid) {
        try {
          const q = query(collection(db, "UserNotes"), where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          userNotes = querySnapshot.docs
            .map(doc => doc.data())
            .filter(data => {
              if (!data.destination) return false;
              const noteCity = data.destination.split(',')[0].trim().toLowerCase();
              const tripCity = formData.destination.split(',')[0].trim().toLowerCase();
              return noteCity === tripCity || data.destination.toLowerCase().includes(tripCity);
            })
            .map(data => data.place);
            
          const profileSnap = await getDoc(doc(db, "UserProfiles", user.uid));
          if (profileSnap.exists()) {
            const pd = profileSnap.data();
            if (pd.healthInfo) formData.healthInfo = pd.healthInfo;
          }
        } catch (err) {
          console.error("Error fetching notes or profile:", err);
        }
      }

      const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
      const res = await fetch(`${FUNCTION_URL}/create-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          travelStyle: Array.isArray(formData.travelStyle) ? formData.travelStyle.map(s => s === 'Other' ? formData.customTravelStyleText : s).filter(Boolean).join(", ") : formData.travelStyle,
          foodPreferences: Array.isArray(formData.foodPreferences) ? formData.foodPreferences.map(s => s === 'Other' ? formData.customFoodPreferenceText : s).filter(Boolean).join(", ") : formData.foodPreferences,
          season: formData.season || "Not specified",
          days: Number(formData.days),
          userId: user?.uid || "anonymous",
          userEmail: user?.email || "anonymous",
          groqApiKey,
          savedNotes: userNotes,
          healthInfo: formData.healthInfo || "",
        }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setJobId(data.jobId);
    } catch (err) {
      console.error(err);
      toast("Failed to start AI Agents.");
      setLoading(false);
      setAgentMode(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-10">
            {/* Start Location */}
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
                          setStartResults([]);
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

            {/* Destination */}
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
                          setResults([]);
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
                  value={formData.people === "5-10 people" || formData.people === "3-5 people" ? "" : formData.people} 
                  onChange={(e) => setFormData(prev => ({ ...prev, people: e.target.value }))}
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
                    value={formData.customTravelStyleText}
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
                    value={formData.customFoodPreferenceText}
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
          <motion.div key="step7" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10 py-10">
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
  };

  if (agentMode) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-amber/5 via-transparent to-coral/5 p-6 pt-24 md:p-12 md:pt-28 font-sans flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-serif font-bold text-ink flex items-center gap-3">
              <Bot className="w-8 h-8 text-amber animate-pulse" /> Agent Swarm Active
            </h2>
            <span className="text-sm font-bold tracking-widest text-ink/40 uppercase animate-pulse">Processing...</span>
          </div>
          
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch min-h-[600px]">
            {/* Left Column: Carousel */}
            <div className="w-full h-full min-h-[400px]">
              <TravelFactsCarousel destination={formData.destination} />
            </div>

            {/* Right Column: Agents */}
            <div className="w-full flex flex-col gap-6">
              <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8 flex items-center justify-center relative overflow-hidden h-[280px]">
                 <AgentOrbs logs={agentLogs} status={agentStatus} />
              </div>
              
              <div className="flex-1 bg-gray-950/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-800 flex flex-col">
                 <AgentTerminal logs={agentLogs} status={agentStatus} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 max-w-3xl mx-auto font-sans">
      
      {/* Progress Bar */}
      <div className="mb-16">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-amber tracking-widest uppercase">Step {step} of 7</span>
          <span className="text-sm font-medium text-gray-400">{Math.round((step / 7) * 100)}%</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber to-coral"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 7) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Main Form Content */}
      <div className="bg-card/80 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-border/50 p-10 md:p-16 min-h-[400px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-10 flex justify-between items-center px-4">
        {step > 1 ? (
          <button onClick={handleBack} className="flex items-center gap-2 text-ink/60 hover:text-ink font-bold transition-colors">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
        ) : <div />}

        {step < 7 ? (
          <button onClick={handleNext} className="flex items-center gap-2 px-8 py-4 bg-ink text-primary-foreground rounded-full font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button 
            disabled={loading}
            onClick={onGenerateWithAgents} 
            className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber to-coral text-primary-foreground rounded-full font-bold text-lg hover:shadow-[0_20px_40px_-15px_rgba(90,161,150,0.5)] transition-all hover:-translate-y-1 disabled:opacity-50"
          >
            {loading ? "Initializing Swarm..." : "Generate Itinerary"}
            {!loading && <PlaneTakeoff className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
}

export default CreateTrip;
