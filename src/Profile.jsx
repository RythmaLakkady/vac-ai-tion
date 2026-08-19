import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import { auth, db } from "./firebase";
import { motion } from "framer-motion";
import { LogOut, Map, Calendar, Users, Globe2, Plane, Sparkles, Trash2, MapPin, HeartPulse } from "lucide-react";

function Profile() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Wander Notes State
  const [activeTab, setActiveTab] = useState('trips');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newNoteDestination, setNewNoteDestination] = useState('');
  const [destinationResults, setDestinationResults] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  
  // Health Info State
  const [healthInfo, setHealthInfo] = useState('');
  const [savingHealth, setSavingHealth] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserTrips(currentUser.email);
        fetchUserNotes(currentUser.uid);
        fetchHealthInfo(currentUser.uid);
      } else {
        setUser(null);
        setTrips([]);
        setNotes([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchHealthInfo = async (userId) => {
    try {
      const docSnap = await getDoc(doc(db, "UserProfiles", userId));
      if (docSnap.exists() && docSnap.data().healthInfo) {
        setHealthInfo(docSnap.data().healthInfo);
      }
    } catch (err) {
      console.error("Error fetching health info:", err);
    }
  };

  const handleSaveHealthInfo = async () => {
    if (!user) return;
    setSavingHealth(true);
    try {
      await setDoc(doc(db, "UserProfiles", user.uid), { healthInfo }, { merge: true });
      alert("Health & Accessibility preferences saved!");
    } catch (err) {
      console.error("Error saving health info:", err);
    }
    setSavingHealth(false);
  };

  const fetchUserNotes = async (userId) => {
    setLoadingNotes(true);
    try {
      const q = query(collection(db, "UserNotes"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const userNotes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory by timestamp descending (if present)
      userNotes.sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return b.timestamp.seconds - a.timestamp.seconds;
      });
      setNotes(userNotes);
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
    setLoadingNotes(false);
  };

  const handleDestinationSearch = async (e) => {
    const value = e.target.value;
    setNewNoteDestination(value);
    if (value.length > 2) {
      try {
        const res = await fetch(`https://api.locationiq.com/v1/autocomplete.php?key=${import.meta.env.VITE__LOCATION_IQ_API_KEY}&q=${value}&limit=5&format=json`);
        const data = await res.json();
        setDestinationResults(data);
      } catch (error) {
        console.error("Autocomplete error:", error);
      }
    } else {
      setDestinationResults([]);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !newNoteDestination.trim() || !user) {
      alert("Please enter both a place and a destination.");
      return;
    }
    try {
      setLoadingNotes(true);
      const noteData = {
        userId: user.uid,
        place: newNote.trim(),
        destination: newNoteDestination.trim(),
        timestamp: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, "UserNotes"), noteData);
      setNotes([{ id: docRef.id, ...noteData, timestamp: { seconds: Date.now() / 1000 } }, ...notes]);
      setNewNote('');
      setNewNoteDestination('');
    } catch (err) {
      console.error("Error adding note:", err);
    }
    setLoadingNotes(false);
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteDoc(doc(db, "UserNotes", noteId));
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const fetchUserTrips = async (userEmail) => {
    setLoading(true);
    try {
      const q = query(collection(db, "UserTrips"), where("userEmail", "==", userEmail));
      const querySnapshot = await getDocs(q);

      const userTrips = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const tripData = data.tripData || {};
        const userSelection = data.userSelection || {};
        
        const destination = userSelection.destination || 
                           (userSelection.location && userSelection.location.label) || 
                           tripData.location || 
                           "Unknown Destination";
                           
        const duration = userSelection.days || 
                        userSelection.noOfDays || 
                        tripData.duration || 
                        "Unknown Duration";
                        
        const travelers = userSelection.travelers || 
                         userSelection.traveler || 
                         tripData.travelers || 
                         "Not Specified";

        return {
          id: doc.id,
          tripName: tripData.trip_name || `${destination} Trip`,
          destination: destination,
          duration: duration,
          travelers: travelers,
          timestamp: data.timestamp || null,
        };
      });

      setTrips(userTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
    setLoading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "No Date";
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Error logging out:", err.message);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 max-w-7xl mx-auto">
      
      {/* Header Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between bg-card/70 backdrop-blur-2xl p-10 rounded-[40px] shadow-sm border border-gray-100 mb-12"
      >
        <div className="flex items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-border shadow-xl bg-ink text-primary-foreground flex items-center justify-center text-5xl font-bold font-serif">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-coral text-primary-foreground p-2 rounded-full shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold font-serif text-ink tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-ink/60 font-medium font-sans">
              {user?.email || "Traveler"}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="mt-8 md:mt-0 flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-primary-foreground rounded-full font-bold transition-colors font-sans"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </motion.div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6"
        >
          <div className="p-4 bg-amber/10 text-amber rounded-2xl">
            <Plane className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Total Trips</p>
            <h3 className="text-3xl font-bold text-ink font-serif">{trips.length}</h3>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6"
        >
          <div className="p-4 bg-coral/10 text-coral rounded-2xl">
            <Globe2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">World Explorer Level</p>
            <h3 className="text-3xl font-bold text-ink font-serif">{trips.length > 5 ? 'Expert' : 'Novice'}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber to-coral p-8 rounded-3xl shadow-xl text-primary-foreground flex flex-col justify-center relative overflow-hidden"
        >
          <Sparkles className="absolute top-4 right-4 w-24 h-24 text-primary-foreground/20" />
          <h3 className="text-2xl font-bold font-serif mb-2">Ready for more?</h3>
          <Link to="/createTrip">
            <button className="px-6 py-2 bg-card text-ink rounded-full font-bold text-sm hover:scale-105 transition-transform w-max">
              Plan New Trip
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-200 pb-4">
        <button 
          onClick={() => setActiveTab('trips')}
          className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'trips' ? 'bg-ink text-primary-foreground' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          Your Itineraries
        </button>
        <button 
          onClick={() => setActiveTab('notes')}
          className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'notes' ? 'bg-ink text-primary-foreground' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          Wander Notes
        </button>
        <button 
          onClick={() => setActiveTab('health')}
          className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'health' ? 'bg-ink text-primary-foreground' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          Health & Accessibility
        </button>
      </div>

      {activeTab === 'trips' ? (
        <>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber"></div>
            </div>
          ) : trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-sans mb-10">
              {trips.map((trip, idx) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  key={trip.id} 
                  className="group bg-card rounded-[32px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-amber transition-all duration-500 flex flex-col h-full relative"
                >
                  {/* Image Header */}
                  <div className="h-48 bg-gray-100 relative overflow-hidden">
                    <img 
                      src={`https://picsum.photos/seed/${trip.id}/800/600`} 
                      alt={trip.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                    <div className="absolute bottom-4 left-6 text-primary-foreground pr-4">
                      <h3 className="text-2xl font-bold font-serif line-clamp-1 drop-shadow-md">{trip?.destination?.split(',')[0]}</h3>
                    </div>
                  </div>
                  <div className="p-8 flex-grow flex flex-col">
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-3 text-ink/70 font-medium">
                        <Calendar className="w-5 h-5 text-coral" />
                        <span>{trip.duration} Days</span>
                      </div>
                      <div className="flex items-center gap-3 text-ink/70 font-medium">
                        <Users className="w-5 h-5 text-amber" />
                        <span className="line-clamp-1">{trip.travelers}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <span>Generated on {trip.timestamp ? formatDate(trip.timestamp) : "No Date"}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto flex items-center gap-2">
                      <Link to={`/view-trip/${trip.id}`} className="flex-1">
                        <button className="w-full py-3 bg-ink text-primary-foreground font-bold rounded-xl hover:bg-amber transition-colors duration-300 shadow-sm hover:shadow-md text-sm">
                          View
                        </button>
                      </Link>
                      <Link to={`/view-trip/${trip.id}?edit=true`} className="flex-1">
                        <button className="w-full py-3 bg-amber/10 text-amber font-bold rounded-xl hover:bg-amber hover:text-primary-foreground transition-colors duration-300 shadow-sm hover:shadow-md text-sm">
                          Modify
                        </button>
                      </Link>
                      <button 
                        onClick={async (e) => {
                          e.preventDefault();
                          if(window.confirm('Are you sure you want to delete this trip?')) {
                            try {
                              await deleteDoc(doc(db, "UserTrips", trip.id));
                              setTrips(trips.filter(t => t.id !== trip.id));
                            } catch(err) {
                              console.error("Failed to delete", err);
                            }
                          }
                        }}
                        className="p-3 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-primary-foreground transition-colors duration-300 shadow-sm hover:shadow-md"
                        title="Delete Trip"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-gray-100 font-sans mb-10">
              <Globe2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500 font-medium">No trips planned yet.</p>
              <Link to="/createTrip">
                <button className="mt-6 px-8 py-3 bg-ink text-primary-foreground font-bold rounded-full hover:scale-105 transition-transform">
                  Start Exploring
                </button>
              </Link>
            </div>
          )}
        </>
      ) : activeTab === 'notes' ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[40px] p-8 shadow-sm border border-gray-100 font-sans mb-10"
        >
          <h2 className="text-3xl font-bold font-serif text-ink mb-2 tracking-tight flex items-center gap-3">
            <Sparkles className="text-amber w-8 h-8" />
            Wander Notes
          </h2>
          <p className="text-gray-500 mb-8">Save places you want to visit. Our AI will try to include them when you plan a trip to that destination!</p>
          
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="e.g. The Louvre"
                className="flex-1 px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-amber focus:outline-none transition-colors text-lg"
              />
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={newNoteDestination}
                  onChange={handleDestinationSearch}
                  placeholder="Destination (e.g. Paris, France)"
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-amber focus:outline-none transition-colors text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                />
                {destinationResults.length > 0 && (
                  <ul className="absolute top-full left-0 w-full bg-card/90 backdrop-blur-xl border border-amber/20 rounded-2xl mt-2 shadow-2xl overflow-hidden z-50">
                    {destinationResults.map((place, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          setNewNoteDestination(place.display_name);
                          setDestinationResults([]);
                        }}
                        className="p-4 cursor-pointer hover:bg-amber/10 flex items-center gap-3 transition-colors text-ink font-sans"
                      >
                        <MapPin className="w-4 h-4 text-amber" /> {place.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button 
                onClick={handleAddNote}
                disabled={loadingNotes || !newNote.trim() || !newNoteDestination.trim()}
                className="px-8 py-4 bg-amber text-primary-foreground font-bold rounded-2xl hover:bg-amber/90 transition-colors disabled:opacity-50 shadow-md whitespace-nowrap"
              >
                Add Place
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {loadingNotes && notes.length === 0 ? (
               <div className="flex justify-center py-10">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber"></div>
               </div>
            ) : notes.length > 0 ? (
              notes.map(note => (
                <div key={note.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-amber/30 transition-colors group">
                  <div>
                    <span className="block text-lg font-bold font-serif text-ink">{note.place}</span>
                    {note.destination && (
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {note.destination}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Note"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">Your notebook is empty. Start saving places!</p>
              </div>
            )}
          </div>
        </motion.div>
      ) : activeTab === 'health' ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[40px] p-8 shadow-sm border border-gray-100 font-sans mb-10"
        >
          <h2 className="text-3xl font-bold font-serif text-ink mb-2 tracking-tight flex items-center gap-3">
            <HeartPulse className="text-coral w-8 h-8" />
            Health & Accessibility Needs
          </h2>
          <p className="text-gray-500 mb-8 max-w-2xl">
            Enter any allergies, dietary restrictions, or accessibility requirements. Our AI Architect will prioritize accommodations that fit your needs and highlight them in your itinerary.
          </p>
          
          <div className="flex flex-col gap-6">
            <textarea
              value={healthInfo}
              onChange={(e) => setHealthInfo(e.target.value)}
              placeholder="e.g., I am allergic to peanuts, I need gluten-free options, I use a wheelchair..."
              className="w-full h-40 px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-coral focus:outline-none transition-colors text-lg resize-none"
            ></textarea>
            
            <button 
              onClick={handleSaveHealthInfo}
              disabled={savingHealth}
              className="px-8 py-4 bg-coral text-primary-foreground font-bold rounded-2xl hover:bg-coral/90 transition-colors disabled:opacity-50 shadow-md w-max"
            >
              {savingHealth ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

export default Profile;
