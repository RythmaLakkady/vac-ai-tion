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
    customFoodPreferenceText: "",
    prebookedFlights: "",
    prebookedHotels: "",
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
    analytics.tripGenerationStarted(formData.destination, formData.days);
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

      const data = await tripService.generateTripJob({
        ...formData,
        travelStyle: Array.isArray(formData.travelStyle) ? formData.travelStyle.map(s => s === 'Other' ? formData.customTravelStyleText : s).filter(Boolean).join(", ") : formData.travelStyle,
        foodPreferences: Array.isArray(formData.foodPreferences) ? formData.foodPreferences.map(s => s === 'Other' ? formData.customFoodPreferenceText : s).filter(Boolean).join(", ") : formData.foodPreferences,
        season: formData.season || "Not specified",
        prebookedFlights: formData.prebookedFlights && formData.prebookedFlights !== "I have booked my flights." ? formData.prebookedFlights : null,
        prebookedHotels: formData.prebookedHotels && formData.prebookedHotels !== "I have booked my hotel." ? formData.prebookedHotels : null,
        days: Number(formData.days),
        userId: user?.uid || "anonymous",
        userEmail: user?.email || "anonymous",
        savedNotes: userNotes,
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

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 max-w-3xl mx-auto font-sans">
      
      {/* Progress Bar */}
      <div className="mb-16">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold text-amber tracking-widest uppercase">Step {step} of 8</span>
          <span className="text-sm font-medium text-gray-400">{Math.round((step / 8) * 100)}%</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber to-coral"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 8) * 100}%` }}
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
        ) : <div />}

        {step < 8 ? (
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

      {/* Auth Modal */}
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
}

export default CreateTrip;
