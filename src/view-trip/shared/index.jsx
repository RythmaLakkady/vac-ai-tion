import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { analytics } from '@/service/analyticsService';

import TripHeader from '../components/TripHeader';
import TripNavigation from '../components/TripNavigation';
import Journey from '../components/Journey';
import Flights from '../components/Flights';
import Hotels from '../components/Hotels';
import WandererNotes from '../components/WandererNotes';

export default function SharedTrip() {
  const { shareId } = useParams();
  const [trip, setTrip] = useState(null); 
  const [itinerary, setItinerary] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState(null);
  const [activeView, setActiveView] = useState('JOURNEY');

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        setExchangeRates(data.rates);
      } catch (err) {
        console.error("Failed to fetch exchange rates", err);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    const GetTripData = async () => {
      const docRef = doc(db, 'SharedTrips', shareId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        data.isReadOnly = true; // Mark as read-only
        setTrip(data);
        if (data?.tripData?.itinerary && Array.isArray(data.tripData.itinerary)) {
          setItinerary(data.tripData.itinerary);
        }
        analytics.trackEvent('public_trip_viewed', { 
          shareId, 
          destination: data?.tripData?.location || data?.userSelection?.destination 
        });
      } else {
        toast.error('Shared trip not found or has been disabled');
      }
    };

    if (shareId) {
      GetTripData();
    }
  }, [shareId]);

  if (!trip) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50">
      <p className='text-gray-500 mb-6'>Loading shared trip...</p>
      <Link to="/" className="text-amber font-bold underline">Go to home</Link>
    </div>
  );

  return (
    <div className='min-h-screen bg-gray-50/50 font-sans'>
      {/* Top Banner indicating read-only */}
      <div className="bg-amber text-white text-center py-2 font-bold text-sm">
        You are viewing a shared read-only trip.
        <Link to="/" className="ml-2 underline hover:text-white/80">Plan your own</Link>
      </div>
      
      {/* Hero Header Area */}
      <div className='bg-card/90 backdrop-blur-xl border-b border-border/50 shadow-sm pt-20 pb-8 px-6 sm:px-10 lg:px-20'>
        <div className='max-w-7xl mx-auto'>
          <TripHeader trip={trip} tripId={null} currency={currency} setCurrency={setCurrency} isReadOnly={true} />
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 pt-6'>
        <TripNavigation activeView={activeView} setActiveView={setActiveView} />
      </div>

      {/* Main Dashboard Layout */}
      <div className='max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12 py-8'>
        
        {activeView === 'JOURNEY' && (
          <div className='w-full'>
            <Journey 
              trip={trip} 
              tripId={null} 
              itinerary={itinerary} 
              setItinerary={() => {}} // Disabled
              currency={currency} 
              exchangeRates={exchangeRates} 
              isReadOnly={true}
            />
          </div>
        )}
        
        {activeView === 'BUDGET' && (
          <div className="p-10 text-center text-gray-500 bg-card rounded-3xl border border-border">Budget dashboard coming soon...</div>
        )}
        
        {activeView === 'GUIDE' && (
          <div className='grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-14'>
            <div className='xl:col-span-8'>
              <div className="p-10 text-center text-gray-500 bg-card rounded-3xl border border-border">Destination guide coming soon...</div>
            </div>
            
            <div className='xl:col-span-4 flex flex-col gap-10'>
              {trip?.tripData?.flight_options?.length > 0 && (
                <div className='bg-card/60 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-border/50'>
                  <Flights trip={trip} currency={currency} exchangeRates={exchangeRates} />
                </div>
              )}
              
              {trip?.tripData?.hotel_options?.length > 0 && (
                <div className='bg-card/60 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-border/50'>
                  <Hotels trip={trip} currency={currency} exchangeRates={exchangeRates} />
                </div>
              )}
              
              {trip?.tripData?.wanderer_notes && (
                <div className='bg-card/60 backdrop-blur-md rounded-3xl shadow-xl p-8 border border-border/50'>
                  <WandererNotes trip={trip} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
