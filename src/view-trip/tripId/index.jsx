import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import InfoSection from '../components/InfoSection';
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
    <div className='min-h-screen pt-32 pb-16 px-6 sm:px-10 lg:px-20 max-w-7xl mx-auto'>
      <div className='bg-white/80 backdrop-blur-md rounded-[40px] shadow-2xl p-10 md:p-14 border border-white/50'>
        {/* information section */}
        <InfoSection trip={trip} currency={currency} setCurrency={setCurrency} />
        
        <div className='my-10 border-t-2 border-holiday-teal/20'></div>
        
        {/* recommended hotels */}
        <Hotels trip={trip} currency={currency} exchangeRates={exchangeRates} />
        
        <div className='my-10 border-t-2 border-holiday-teal/20'></div>
        
        {/* wanderer notes (global) */}
        <WandererNotes trip={trip} />

        {/* daily plan */}
        <Itinerary trip={trip} currency={currency} exchangeRates={exchangeRates} />
      </div>

      {/* Floating AI Chatbot */}
      <AIChatbot trip={trip} setTrip={setTrip} setCurrency={setCurrency} />
    </div>
  );
}

export default ViewTrip;
