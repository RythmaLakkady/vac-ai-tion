import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Users, Wallet, ChevronRight, ChevronLeft, Sparkles, PlaneTakeoff, Bot, Compass } from "lucide-react";
import { AI_PROMPT, SelectBudgetOptions, SelectTravelersList, SelectTravelStyleList } from "@/constants/options";
import { chatSession } from "@/service/AImodel";
import { analytics } from "@/service/analyticsService";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import AuthModal from "@/components/ui/custom/AuthModal";
import AgentTerminal from "@/components/ui/custom/AgentTerminal";
import AgentOrbs from "@/components/ui/custom/AgentOrbs";
import TravelFactsCarousel from "@/components/ui/custom/TravelFactsCarousel";

import { tripService } from "@/service/tripService";
import { destinationService } from "@/service/destinationService";

import TripForm from "./components/TripForm";
import TripGenerationProgress from "./components/TripGenerationProgress";
import SmartTripDiscovery from "./components/SmartTripDiscovery";

function CreateTrip() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [entryMode, setEntryMode] = useState(null); // null, 'KNOWN', 'DISCOVERY'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    startLocation: "",
    destination: location.state?.prefillDestination || location.state?.destination || "",
    days: "",
    startDate: null,
    endDate: null,
    budget: "",
    travelers: "",
    people: "",
    travelStyle: [],
    season: "",
    prebookedFlights: "",
    prebookedHotels: "",
    selectedPlaces: location.state?.selectedPlaces || [],
  });
  
  // Search State
  const [query, setQuery] = useState(location.state?.prefillDestination || location.state?.destination || "");
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
        if (data.completedAt && data.createdAt) {
          const latency = data.completedAt.toMillis() - data.createdAt.toMillis();
          analytics.tripGenerationCompleted(jobId, latency);
        } else {
          analytics.tripGenerationCompleted(jobId, 0);
        }
        setTimeout(() => navigate("/view-trip/" + data.tripDocId), 1500);
      }
      if (data.status === "failed") {
        setLoading(false);
        setAgentMode(false);
        toast.error("Trip generation failed: The AI might be overloaded. Please try again.");
      }
    });
    return () => unsubscribe();
  }, [jobId, navigate]);

  const handleStartSearch = async (e) => {
    const value = e.target.value;
    setStartQuery(value);
    setFormData(prev => ({ ...prev, startLocation: value }));
    if (value.length > 2) {
      const data = await destinationService.searchDestinations(value);
      setStartResults(data);
    } else {
      setStartResults([]);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    setFormData(prev => ({ ...prev, destination: value }));
    if (value.length > 2) {
      const data = await destinationService.searchDestinations(value);
      setResults(data);
    } else {
      setResults([]);
    }
  };

  const handleNext = () => {
    if (step === 1 && (!formData.startLocation || !formData.destination)) return toast("Please enter both your origin and destination.");
    if (step === 2 && (!formData.startDate || !formData.endDate)) return toast("Please select a date range.");
    if (step === 3) {
      if (!formData.travelers) return toast("Please select your travel companions.");
      if (['Friends', 'Family'].includes(formData.travelers) && (!formData.people || isNaN(formData.people))) {
        return toast("Please enter a valid number of people.");
      }
    }
    if (step === 4 && !formData.budget) return toast("Please select or enter a budget.");
    if (step === 5 && (!formData.travelStyle || formData.travelStyle.length === 0)) return toast("Please select at least one travel style.");
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step === 1) setEntryMode(null);
    else setStep((prev) => prev - 1);
  };

  const handleDiscoveredDestination = (discoveredData) => {
    setFormData(prev => ({
      ...prev,
      destination: discoveredData.destination,
      days: discoveredData.days,
      startDate: discoveredData.startDate,
      endDate: discoveredData.endDate,
      travelers: discoveredData.travelers,
      budget: discoveredData.budget,
      discoveryIntent: discoveredData.discoveryIntent
    }));
    setQuery(discoveredData.destination);
    setEntryMode('KNOWN');
    setStep(1); // Drop them into TripForm step 1 to review
  };

  const onGenerateWithAgents = async () => {
    if (!isLoggedIn) return setIsModalOpen(true);
    setLoading(true);
    setAgentMode(true);
    analytics.tripGenerationStarted(formData.destination, formData.days);
    try {
      const user = auth.currentUser;
      
      let userNotes = [];
      if (user?.uid) {
        try {
          const q = query(collection(db, "SavedPlaces"), where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          userNotes = querySnapshot.docs
            .map(doc => doc.data())
            .filter(data => {
              if (!data.destination) return false;
              const noteCity = data.destination.split(',')[0].trim().toLowerCase();
              const tripCity = formData.destination.split(',')[0].trim().toLowerCase();
              return noteCity === tripCity || data.destination.toLowerCase().includes(tripCity);
            })
            .map(data => data.name);
            
          const profileSnap = await getDoc(doc(db, "UserProfiles", user.uid));
          if (profileSnap.exists()) {
            const pd = profileSnap.data();
            if (pd.healthInfo) formData.healthInfo = pd.healthInfo;
          }
        } catch (err) {
          console.error("Error fetching notes or profile:", err);
        }
      }

      // Combine automatically fetched userNotes and explicitly selected places
      const explicitPlaces = (formData.selectedPlaces || []).map(p => p.name);
      const combinedNotes = [...new Set([...userNotes, ...explicitPlaces])];

      const data = await tripService.generateTripJob({
        ...formData,
        travelStyle: Array.isArray(formData.travelStyle) ? formData.travelStyle.map(s => s === 'Other' ? formData.customTravelStyleText : s).filter(Boolean).join(", ") : formData.travelStyle,
        season: formData.season || "Not specified",
        prebookedFlights: formData.prebookedFlights && formData.prebookedFlights !== "I have booked my flights." ? formData.prebookedFlights : null,
        prebookedHotels: formData.prebookedHotels && formData.prebookedHotels !== "I have booked my hotel." ? formData.prebookedHotels : null,
        days: Number(formData.days),
        userId: user?.uid || "anonymous",
        userEmail: user?.email || "anonymous",
        savedNotes: combinedNotes,
        healthInfo: formData.healthInfo || "",
      });
      setJobId(data.jobId);
    } catch (err) {
      console.error(err);
      analytics.tripGenerationFailed(err.message);
      toast.error(err.message || "Failed to start AI Agents. Please check your connection.");
      setLoading(false);
      setAgentMode(false);
    }
  };

  // renderStep logic moved to TripForm

  if (agentMode) {
    return <TripGenerationProgress destination={formData.destination} agentLogs={agentLogs} agentStatus={agentStatus} />;
  }

  // ENTRY MODE SELECTION
  if (entryMode === null) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-6 max-w-4xl mx-auto font-sans flex flex-col items-center justify-center space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-serif font-black text-ink">How do you want to begin?</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">Start with a destination in mind, or let us help you find the perfect spot based on what you're looking for.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setEntryMode('KNOWN')}
            className="p-10 bg-white border border-gray-200 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-amber/50 cursor-pointer transition-all flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 bg-amber/10 rounded-full flex justify-center items-center mb-6 group-hover:scale-110 transition-transform">
              <MapPin className="w-10 h-10 text-amber" />
            </div>
            <h2 className="text-3xl font-bold font-serif text-ink mb-3">I know where I want to go</h2>
            <p className="text-gray-500 font-medium">I already have a destination. Let's plan the itinerary.</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setEntryMode('DISCOVERY')}
            className="p-10 bg-white border border-gray-200 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-coral/50 cursor-pointer transition-all flex flex-col items-center text-center group"
          >
            <div className="w-20 h-20 bg-coral/10 rounded-full flex justify-center items-center mb-6 group-hover:scale-110 transition-transform">
              <Sparkles className="w-10 h-10 text-coral" />
            </div>
            <h2 className="text-3xl font-bold font-serif text-ink mb-3">Help me decide</h2>
            <p className="text-gray-500 font-medium">I don't have a specific destination yet. Suggest somewhere for me.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 max-w-3xl mx-auto font-sans">
      
      {entryMode === 'DISCOVERY' ? (
        <SmartTripDiscovery onDestinationSelected={handleDiscoveredDestination} />
      ) : (
        <>
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
      <div className="bg-card rounded-[32px] shadow-sm border border-border p-10 md:p-16 min-h-[400px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <TripForm 
            step={step}
            formData={formData}
            setFormData={setFormData}
            startQuery={startQuery}
            handleStartSearch={handleStartSearch}
            startResults={startResults}
            setStartResults={setStartResults}
            setSelectedStartPlace={setSelectedStartPlace}
            setStartQuery={setStartQuery}
            query={query}
            handleSearch={handleSearch}
            results={results}
            setResults={setResults}
            setSelectedPlace={setSelectedPlace}
            setQuery={setQuery}
            customCurrency={customCurrency}
            setCustomCurrency={setCustomCurrency}
          />
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-10 flex justify-between items-center px-4">
        {step > 1 ? (
          <button onClick={handleBack} className="flex items-center gap-2 text-ink/60 hover:text-ink font-bold transition-colors">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
        ) : <button onClick={handleBack} className="flex items-center gap-2 text-ink/60 hover:text-ink font-bold transition-colors"><ChevronLeft className="w-5 h-5" /> Back</button>}

        {step < 7 ? (
          <button onClick={handleNext} className="flex items-center gap-2 px-8 py-4 bg-ink text-primary-foreground rounded-full font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button 
            disabled={loading}
            onClick={onGenerateWithAgents} 
            className="flex items-center gap-3 px-10 py-4 bg-ink text-white rounded-full font-bold text-lg hover:bg-black transition-all hover:-translate-y-1 disabled:opacity-50"
          >
            {loading ? "Initializing Swarm..." : "Generate Itinerary"}
            {!loading && <PlaneTakeoff className="w-5 h-5" />}
          </button>
        )}
      </div>
        </>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
}

export default CreateTrip;
