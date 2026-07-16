import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { auth, db } from "./firebase";
<<<<<<< HEAD
=======
import { motion } from "framer-motion";
import { LogOut, Map, Calendar, Users, Globe2, Plane, Sparkles, Trash2 } from "lucide-react";
>>>>>>> c46005a (Initialize WanderGen trip planner)

function Profile() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
<<<<<<< HEAD
    console.log("Current User:", currentUser);

=======
>>>>>>> c46005a (Initialize WanderGen trip planner)
    if (currentUser) {
      setUser(currentUser);
      fetchUserTrips(currentUser.email);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserTrips = async (userEmail) => {
    setLoading(true);
    try {
<<<<<<< HEAD
      console.log("Fetching trips for:", userEmail);

      const q = query(collection(db, "UserTrips"), where("userEmail", "==", userEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("No trips found for user:", userEmail);
      }

      const userTrips = querySnapshot.docs.map((doc) => {
        const tripData = doc.data().tripData || {};
        console.log("Trip Data:", tripData);
        return {
          id: doc.id,
          tripName: tripData.trip_name || "Untitled Trip",
          destination: tripData.location || "Unknown Destination",
          duration: tripData.duration || "Unknown Duration",
          travelers: tripData.travelers || "Not Specified",
          timestamp: doc.data().timestamp || null,
=======
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
>>>>>>> c46005a (Initialize WanderGen trip planner)
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
<<<<<<< HEAD
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
=======
    return date.toLocaleDateString("en-US", {
>>>>>>> c46005a (Initialize WanderGen trip planner)
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
<<<<<<< HEAD
      console.log("Logged out successfully");
=======
>>>>>>> c46005a (Initialize WanderGen trip planner)
    } catch (err) {
      console.error("Error logging out:", err.message);
    }
  };

  return (
<<<<<<< HEAD
    <div className="flex justify-center items-center min-h-screen p-6 bg-gray-100">
      <div className="w-full max-w-4xl p-8 border rounded-lg shadow-lg bg-white">
        <h2 className="text-3xl font-serif font-semibold text-[#7AB9B3] my-4 text-center">
          Your Profile
        </h2>

        {/* Email Box */}
        <div className="bg-[#FD9C7E] p-6 rounded-lg text-white font-serif text-lg mb-6 shadow-md">
          {user && (
            <div className="text-center">
              <p className="text-xl font-semibold">📧 Email</p>
              <p className="mt-1">{user.email}</p>
            </div>
          )}
        </div>

        {/* Trips Summary Box */}
        <div className="bg-[#7AB9B3] p-6 rounded-lg text-white font-serif text-lg mb-6 shadow-md text-center">
          <h3 className="text-xl font-semibold">🧳 Your Trips</h3>
          <p className="mt-1 text-lg">
            You have {trips.length} {trips.length === 1 ? "trip" : "trips"} planned.
          </p>
        </div>

        {/* Previous Trips */}
        <h3 className="text-xl font-serif font-semibold mt-6 text-center">
          Your Previous Trips
        </h3>
        {loading ? (
          <p className="text-gray-500 text-center">Loading trips...</p>
        ) : trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {trips.map((trip) => (
              <div key={trip.id} className="p-4 border rounded-lg shadow hover:shadow-md bg-white">
                <h3 className="text-lg font-serif font-semibold">{trip.tripName}</h3>
                <p className="text-gray-600">📍 Destination: {trip.destination}</p>
                <p className="text-gray-600">🕒 Duration: {trip.duration}</p>
                <p className="text-gray-600">👥 Travelers: {trip.travelers}</p>
                <p className="text-gray-600">📅 Created on: {trip.timestamp ? formatDate(trip.timestamp) : "No Date"}</p>
                
                <Link to={`/view-trip/${trip.id}`} className="text-[#7AB9B3] hover:underline mt-2 block">
                  View Trip Details →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-4">No trips found.</p>
        )}

        {/* Sign Out Button */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleSignOut}
            className="py-2 px-6 bg-[#7AB9B3] text-white rounded hover:bg-[#66a19b] shadow-md"
          >
            Sign Out
          </button>
        </div>
      </div>
=======
    <div className="min-h-screen pt-32 pb-16 px-6 max-w-7xl mx-auto">
      
      {/* Header Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between bg-white/70 backdrop-blur-2xl p-10 rounded-[40px] shadow-sm border border-gray-100 mb-12"
      >
        <div className="flex items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-holiday-dark text-white flex items-center justify-center text-5xl font-bold font-serif">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-holiday-coral text-white p-2 rounded-full shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold font-serif text-holiday-dark tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-holiday-dark/60 font-medium font-sans">
              {user?.email || "Traveler"}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="mt-8 md:mt-0 flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-full font-bold transition-colors font-sans"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </motion.div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6"
        >
          <div className="p-4 bg-holiday-teal/10 text-holiday-teal rounded-2xl">
            <Plane className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Total Trips</p>
            <h3 className="text-3xl font-bold text-holiday-dark font-serif">{trips.length}</h3>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6"
        >
          <div className="p-4 bg-holiday-coral/10 text-holiday-coral rounded-2xl">
            <Globe2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">World Explorer Level</p>
            <h3 className="text-3xl font-bold text-holiday-dark font-serif">{trips.length > 5 ? 'Expert' : 'Novice'}</h3>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-holiday-teal to-holiday-coral p-8 rounded-3xl shadow-xl text-white flex flex-col justify-center relative overflow-hidden"
        >
          <Sparkles className="absolute top-4 right-4 w-24 h-24 text-white/20" />
          <h3 className="text-2xl font-bold font-serif mb-2">Ready for more?</h3>
          <Link to="/createTrip">
            <button className="px-6 py-2 bg-white text-holiday-dark rounded-full font-bold text-sm hover:scale-105 transition-transform w-max">
              Plan New Trip
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Trips Grid */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold font-serif text-holiday-dark tracking-tight">Your Itineraries</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-holiday-teal"></div>
        </div>
      ) : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-sans">
          {trips.map((trip, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              key={trip.id} 
              className="group bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-holiday-teal transition-all duration-500 flex flex-col h-full relative"
            >
              {/* Image Header */}
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${trip.id}/800/600`} 
                  alt={trip.destination}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-holiday-dark/60 to-transparent" />
                <div className="absolute bottom-4 left-6 text-white pr-4">
                  <h3 className="text-2xl font-bold font-serif line-clamp-1 drop-shadow-md">{trip?.destination?.split(',')[0]}</h3>
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-holiday-dark/70 font-medium">
                    <Calendar className="w-5 h-5 text-holiday-coral" />
                    <span>{trip.duration} Days</span>
                  </div>
                  <div className="flex items-center gap-3 text-holiday-dark/70 font-medium">
                    <Users className="w-5 h-5 text-holiday-teal" />
                    <span className="line-clamp-1">{trip.travelers}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <span>Generated on {trip.timestamp ? formatDate(trip.timestamp) : "No Date"}</span>
                  </div>
                </div>
                
                <div className="mt-auto flex items-center gap-2">
                  <Link to={`/view-trip/${trip.id}`} className="flex-1">
                    <button className="w-full py-3 bg-holiday-dark text-white font-bold rounded-xl hover:bg-holiday-teal transition-colors duration-300 shadow-sm hover:shadow-md text-sm">
                      View
                    </button>
                  </Link>
                  <Link to={`/view-trip/${trip.id}?edit=true`} className="flex-1">
                    <button className="w-full py-3 bg-holiday-teal/10 text-holiday-teal font-bold rounded-xl hover:bg-holiday-teal hover:text-white transition-colors duration-300 shadow-sm hover:shadow-md text-sm">
                      Modify
                    </button>
                  </Link>
                  <button 
                    onClick={async (e) => {
                      e.preventDefault();
                      if(window.confirm('Are you sure you want to delete this trip?')) {
                        try {
                          const { doc, deleteDoc } = await import('firebase/firestore');
                          await deleteDoc(doc(db, "UserTrips", trip.id));
                          setTrips(trips.filter(t => t.id !== trip.id));
                        } catch(err) {
                          console.error("Failed to delete", err);
                        }
                      }
                    }}
                    className="p-3 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors duration-300 shadow-sm hover:shadow-md"
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
        <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-gray-100 font-sans">
          <Globe2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500 font-medium">No trips planned yet.</p>
          <Link to="/createTrip">
            <button className="mt-6 px-8 py-3 bg-holiday-dark text-white font-bold rounded-full hover:scale-105 transition-transform">
              Start Exploring
            </button>
          </Link>
        </div>
      )}
>>>>>>> c46005a (Initialize WanderGen trip planner)
    </div>
  );
}

export default Profile;
