import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Flights from '../components/Flights';
import Hotels from '../components/Hotels';
import Itinerary from '../components/Itinerary';
import WandererNotes from '../components/WandererNotes';
import AIChatbot from '../../components/ui/custom/AIChatbot';
import { analytics } from '@/service/analyticsService';

import TripHeader from '../components/TripHeader';
import TripNavigation from '../components/TripNavigation';
import TripRoadmap from '../components/TripRoadmap';
import TripTimeline from '../components/TripTimeline';

function ViewTrip() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null); 
  const [itinerary, setItinerary] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState(null);
  const [activeView, setActiveView] = useState('ROADMAP');

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
      const docRef = doc(db, 'UserTrips', tripId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTrip(data);
        if (data?.tripData?.itinerary && Array.isArray(data.tripData.itinerary)) {
          setItinerary(data.tripData.itinerary);
        }
        analytics.trackEvent('itinerary_viewed', { 
          tripId, 
          destination: data?.tripData?.location || data?.userSelection?.destination 
        });
      } else {
        console.log('no such doc');
        toast('No trip found');
      }
    };

    if (tripId) {
      GetTripData();
    }
  }, [tripId]);

  if (!trip) return <p className='text-center text-gray-500 mt-20'>Loading trip details...</p>;

  return (
    <div className='min-h-screen bg-gray-50/50 font-sans'>
      {/* Hero Header Area */}
      <div className='bg-card/90 backdrop-blur-xl border-b border-border/50 shadow-sm pt-32 pb-8 px-6 sm:px-10 lg:px-20'>
        <div className='max-w-7xl mx-auto'>
          <TripHeader trip={trip} currency={currency} setCurrency={setCurrency} />
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 pt-6'>
        <TripNavigation activeView={activeView} setActiveView={setActiveView} />
      </div>

      {/* Main Dashboard Layout */}
      <div className='max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 py-8'>
        <div className='grid grid-cols-1 xl:grid-cols-12 gap-10 lg:gap-14'>
          
          {/* Left/Main Column: Active View */}
          <div className='xl:col-span-8'>
            {activeView === 'ROADMAP' && (
              <TripRoadmap itinerary={itinerary} currency={currency} exchangeRates={exchangeRates} />
            )}
            {activeView === 'TIMELINE' && (
              <TripTimeline itinerary={itinerary} currency={currency} exchangeRates={exchangeRates} />
            )}
            {activeView === 'DAYS' && (
              <div className='bg-card/60 backdrop-blur-md rounded-[40px] shadow-xl p-8 sm:p-10 border border-border/50'>
                <Itinerary trip={trip} currency={currency} exchangeRates={exchangeRates} itinerary={itinerary} setItinerary={setItinerary} />
              </div>
            )}
            {activeView === 'MAP' && (
              <div className="p-10 text-center text-gray-500 bg-card rounded-3xl border border-border">Map integration coming soon...</div>
            )}
            {activeView === 'BUDGET' && (
              <div className="p-10 text-center text-gray-500 bg-card rounded-3xl border border-border">Budget dashboard coming soon...</div>
            )}
            {activeView === 'GUIDE' && (
              <div className="p-10 text-center text-gray-500 bg-card rounded-3xl border border-border">Destination guide coming soon...</div>
            )}
          </div>
          
          {/* Right Column: Widgets */}
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
      </div>

      {/* Floating AI Chatbot */}
      <AIChatbot trip={trip} setTrip={setTrip} setCurrency={setCurrency} />
    </div>
  );
}

export default ViewTrip;
