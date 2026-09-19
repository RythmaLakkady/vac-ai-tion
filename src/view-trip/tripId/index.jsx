import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import InfoSection from '../components/InfoSection';
import Flights from '../components/Flights';
import Hotels from '../components/Hotels';
import Itinerary from '../components/Itinerary';
import WandererNotes from '../components/WandererNotes';
import AIChatbot from '../../components/ui/custom/AIChatbot';

function ViewTrip() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null); 
  const [currency, setCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState(null);

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
        console.log('document: ', docSnap.data());
        setTrip(docSnap.data());
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
      <div className='bg-card/90 backdrop-blur-xl border-b border-border/50 shadow-sm pt-32 pb-10 px-6 sm:px-10 lg:px-20'>
        <div className='max-w-7xl mx-auto'>
          <InfoSection trip={trip} currency={currency} setCurrency={setCurrency} />
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className='max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 py-12'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14'>
          
          {/* Left/Main Column: Itinerary */}
          <div className='lg:col-span-7 xl:col-span-8'>
            <div className='bg-card/60 backdrop-blur-md rounded-[40px] shadow-xl p-8 sm:p-10 border border-border/50'>
              <Itinerary trip={trip} currency={currency} exchangeRates={exchangeRates} />
            </div>
          </div>
          
          {/* Right Column: Widgets (Flights, Hotels, Notes) */}
          <div className='lg:col-span-5 xl:col-span-4 flex flex-col gap-10'>
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
