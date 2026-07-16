import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Users, Wallet, ChevronRight, ChevronLeft, Sparkles, PlaneTakeoff, Bot } from "lucide-react";
import { AI_PROMPT, SelectBudgetOptions, SelectTravelersList } from "@/constants/options";
import { chatSession } from "@/service/AImodel";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import Modal from "@/components/ui/custom/Modal";
import AgentTerminal from "@/components/ui/custom/AgentTerminal";
import AgentOrbs from "@/components/ui/custom/AgentOrbs";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const FUNCTION_URL = import.meta.env.VITE_PRICE_FUNCTION_URL || 
  (isLocal ? "http://127.0.0.1:5001/wandergen---ai-travel-planner/us-central1/priceAggregator" 
           : "https://us-central1-wandergen---ai-travel-planner.cloudfunctions.net/priceAggregator");

function CreateTrip() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    destination: "",
    days: "",
    budget: "",
    travelers: "",
    people: "",
  });
  
  // Search State
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  // Agent State
  const [agentMode, setAgentMode] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [agentStatus, setAgentStatus] = useState("pending");
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
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

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 2) {
      try {
        const res = await fetch(`https://api.locationiq.com/v1/autocomplete.php?key=pk.eb1ca2dd56903301b770e16676fe0560&q=${value}&limit=5&format=json`);
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
    if (step === 1 && !formData.destination) return toast("Please select a destination.");
    if (step === 2 && (!formData.days || formData.days > 20)) return toast("Please enter valid days (max 20).");
    if (step === 3 && !formData.travelers) return toast("Please select who is traveling.");
    if (step === 4 && !formData.budget) return toast("Please select a budget.");
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const onGenerateWithAgents = async () => {
    if (!isLoggedIn) return setIsModalOpen(true);
    setLoading(true);
    setAgentMode(true);
    try {
      const user = auth.currentUser;
      const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
      const res = await fetch(`${FUNCTION_URL}/create-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          days: Number(formData.days),
          userId: user?.uid || "anonymous",
          userEmail: user?.email || "anonymous",
          groqApiKey,
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
          <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
            <div className="flex items-center gap-3 text-holiday-dark mb-2">
              <div className="p-3 bg-holiday-teal/10 rounded-full"><MapPin className="w-6 h-6 text-holiday-teal" /></div>
              <h2 className="text-4xl font-serif font-bold">Where to?</h2>
            </div>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="Search destination (e.g. Kyoto, Japan)"
                className="w-full text-2xl font-sans bg-transparent border-b-2 border-gray-300 pb-4 focus:outline-none focus:border-holiday-teal transition-colors"
                autoFocus
              />
              {results.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-white/90 backdrop-blur-xl border border-holiday-teal/20 rounded-2xl mt-2 shadow-2xl overflow-hidden z-50">
                  {results.map((place, idx) => (
                    <li
                      key={idx}
                      onClick={() => {
                        setSelectedPlace(place);
                        setQuery(place.display_name);
                        setFormData((prev) => ({ ...prev, destination: place.display_name }));
                        setResults([]);
                      }}
                      className="p-4 cursor-pointer hover:bg-holiday-teal/10 flex items-center gap-3 transition-colors text-holiday-dark font-sans"
                    >
                      <MapPin className="w-4 h-4 text-holiday-teal" /> {place.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
            <div className="flex items-center gap-3 text-holiday-dark mb-2">
              <div className="p-3 bg-holiday-coral/10 rounded-full"><Calendar className="w-6 h-6 text-holiday-coral" /></div>
              <h2 className="text-4xl font-serif font-bold">How many days?</h2>
            </div>
            <input
              type="number"
              value={formData.days}
              onChange={(e) => setFormData(prev => ({ ...prev, days: e.target.value }))}
              placeholder="e.g. 5"
              className="w-full text-4xl font-sans font-light bg-transparent border-b-2 border-gray-300 pb-4 focus:outline-none focus:border-holiday-coral transition-colors"
              autoFocus
            />
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
            <div className="flex items-center gap-3 text-holiday-dark mb-6">
              <div className="p-3 bg-holiday-teal/10 rounded-full"><Users className="w-6 h-6 text-holiday-teal" /></div>
              <h2 className="text-4xl font-serif font-bold">Who's traveling?</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {SelectTravelersList.map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData(prev => ({ ...prev, travelers: item.title, people: item.people }))}
                  className={`p-6 cursor-pointer rounded-3xl border-2 transition-all ${formData.travelers === item.title ? "border-holiday-teal bg-holiday-teal/5" : "border-gray-200 hover:border-holiday-teal/50"}`}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-bold text-xl font-sans text-holiday-dark">{item.title}</h3>
                  <p className="text-holiday-dark/60 text-sm mt-1 font-sans">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
            <div className="flex items-center gap-3 text-holiday-dark mb-6">
              <div className="p-3 bg-holiday-coral/10 rounded-full"><Wallet className="w-6 h-6 text-holiday-coral" /></div>
              <h2 className="text-4xl font-serif font-bold">What's your budget?</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {SelectBudgetOptions.map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData(prev => ({ ...prev, budget: item.title }))}
                  className={`p-6 cursor-pointer rounded-3xl border-2 flex items-center gap-6 transition-all ${formData.budget === item.title ? "border-holiday-coral bg-holiday-coral/5" : "border-gray-200 hover:border-holiday-coral/50"}`}
                >
                  <div className="text-5xl">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-xl font-sans text-holiday-dark">{item.title}</h3>
                    <p className="text-holiday-dark/60 text-sm mt-1 font-sans">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10 py-10">
            <div className="inline-flex justify-center items-center w-24 h-24 bg-gradient-to-tr from-holiday-teal to-holiday-coral rounded-full shadow-2xl mb-4 animate-bounce">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-5xl font-serif font-bold text-holiday-dark">Ready for magic?</h2>
            <p className="text-xl text-holiday-dark/80 max-w-md mx-auto font-sans leading-relaxed">
              Our Agent Swarm is standing by to craft the perfect itinerary for your {formData.days}-day trip to <span className="font-bold">{formData.destination}</span>.
            </p>
          </motion.div>
        );
      default: return null;
    }
  };

  if (agentMode) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center pt-20 px-4 font-serif">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-holiday-dark mb-4 flex items-center justify-center gap-3">
            <Bot className="w-10 h-10 text-holiday-teal" /> Agent Swarm Active
          </h2>
          <p className="text-xl text-holiday-dark/60 font-sans">
            Watch your AI agents collaborate in real-time to craft the perfect itinerary
          </p>
        </div>
        <div className="w-full flex justify-center mb-16">
          <AgentOrbs logs={agentLogs} status={agentStatus} />
        </div>
        <div className="w-full max-w-3xl shadow-2xl rounded-xl overflow-hidden font-sans">
          <AgentTerminal logs={agentLogs} status={agentStatus} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 max-w-3xl mx-auto font-sans">
      
      {/* Progress Bar */}
      <div className="mb-16">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-holiday-teal tracking-widest uppercase">Step {step} of 5</span>
          <span className="text-sm font-medium text-gray-400">{Math.round((step / 5) * 100)}%</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-holiday-teal to-holiday-coral"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 5) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Main Form Content */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/50 p-10 md:p-16 min-h-[400px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-10 flex justify-between items-center px-4">
        {step > 1 ? (
          <button onClick={handleBack} className="flex items-center gap-2 text-holiday-dark/60 hover:text-holiday-dark font-bold transition-colors">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
        ) : <div />}

        {step < 5 ? (
          <button onClick={handleNext} className="flex items-center gap-2 px-8 py-4 bg-holiday-dark text-white rounded-full font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button 
            disabled={loading}
            onClick={onGenerateWithAgents} 
            className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-holiday-teal to-holiday-coral text-white rounded-full font-bold text-lg hover:shadow-[0_20px_40px_-15px_rgba(90,161,150,0.5)] transition-all hover:-translate-y-1 disabled:opacity-50"
          >
            {loading ? "Initializing Swarm..." : "Generate Itinerary"}
            {!loading && <PlaneTakeoff className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Sign In Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-2xl font-serif font-bold text-holiday-dark mb-4 text-center">Save Your Journey</h2>
        <p className="text-gray-500 mb-8 text-center font-sans">Sign in securely with Google to generate and save your AI-crafted itinerary.</p>
        <button
          onClick={() => {
            setIsModalOpen(false);
            navigate('/signIn');
          }}
          className="w-full py-4 bg-black text-white font-bold rounded-xl flex justify-center items-center gap-2 hover:bg-gray-800 transition-colors font-sans"
        >
          <img src="/google-logo.svg" alt="Google" className="w-6 h-6 bg-white rounded-full p-1" />
          Sign in with Google
        </button>
      </Modal>

    </div>
  );
}

export default CreateTrip;
