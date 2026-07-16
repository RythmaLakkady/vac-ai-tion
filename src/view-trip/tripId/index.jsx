import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
<<<<<<< HEAD
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
=======
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
>>>>>>> c46005a (Initialize WanderGen trip planner)
import { toast } from 'sonner';
import InfoSection from '../components/InfoSection';
import Hotels from '../components/Hotels';
import Itinerary from '../components/Itinerary';
<<<<<<< HEAD




function ViewTrip() {
    const {tripId}=useParams();
    const [trip,setTrip] = useState([]);
    useEffect(()=>{
        tripId&&GetTripData();
    },[tripId])

    const GetTripData=async ()=>{
        const docRef = doc(db,'UserTrips',tripId);
        const docSnap = await getDoc(docRef);

        if(docSnap.exists()){
            console.log("document: ",docSnap.data());
            setTrip(docSnap.data());
        }
        else{
            console.log("no such doc");
            toast("no trip found")
        }
    }

  return (
    <div className='p-10 md:px-20 lg:px-44 xl:px-56'>
      {/* information section */}
        <InfoSection trip={trip} />
      {/* recommended hotels */}
        <Hotels trip={trip} />
      {/* daily plan */}
        <Itinerary trip={trip} />
    </div>
  )
}

export default ViewTrip
=======
import AIChatbot from '../../components/ui/custom/AIChatbot';

function ViewTrip() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null); // ✅ FIX: use object or null

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
        <InfoSection trip={trip} />
        
        <div className='my-10 border-t-2 border-holiday-teal/20'></div>
        
        {/* recommended hotels */}
        <Hotels trip={trip} />
        
        <div className='my-10 border-t-2 border-holiday-teal/20'></div>
        
        {/* daily plan */}
        <Itinerary trip={trip} />
      </div>

      {/* Floating AI Chatbot */}
      <AIChatbot trip={trip} setTrip={setTrip} />
    </div>
  );
}

export default ViewTrip;
>>>>>>> c46005a (Initialize WanderGen trip planner)
