<<<<<<< HEAD
import { Button } from '@/components/ui/button'
import React from 'react'
import { LuSend } from "react-icons/lu";
=======

import PropTypes from 'prop-types';
>>>>>>> c46005a (Initialize WanderGen trip planner)

function InfoSection({trip}) {
  return (
    <div>
      
    <div className='flex justify-between items-center'>
<<<<<<< HEAD
    <div className='my-5 flex flex-col gap-2'>
        <h2 className='text-3xl font-semibold font-serif mt-2'>
        📍 {trip?.userSelection?.destination || 'No Destination'}
        </h2>

        <div className='flex gap-5'>
        <h2 className='p-1 px-3 bg-gray-100 rounded-full text-gray-700 text-xs md:text-lg'>
        📅 {trip?.userSelection?.days} {trip?.userSelection?.days === "1" ? "Day" : "Days"}
        </h2>
        <h2 className='p-1 px-3 bg-gray-100 rounded-full text-gray-700 text-xs md:text-lg'>
        💰 Budget: {trip?.userSelection?.budget}
        </h2>
        <h2 className='p-1 px-3 bg-gray-100 rounded-full text-gray-700 text-xs md:text-lg'>
        👥 Travelers: {trip?.userSelection?.travelers}
        </h2>


        </div>
    </div>
    

=======
      <div className='flex flex-col gap-4 w-full'>
        <h2 className='text-4xl font-bold font-serif text-holiday-dark drop-shadow-sm'>
          📍 {trip?.userSelection?.destination || 'No Destination'}
        </h2>

        <div className='flex flex-wrap gap-4 mt-2'>
          <h2 className='p-2 px-5 bg-holiday-teal text-white rounded-full font-bold shadow-md text-sm md:text-base'>
            📅 {trip?.userSelection?.days} {trip?.userSelection?.days === "1" ? "Day" : "Days"}
          </h2>
          <h2 className='p-2 px-5 bg-holiday-teal text-white rounded-full font-bold shadow-md text-sm md:text-base'>
            💰 Budget: {trip?.userSelection?.budget}
          </h2>
          <h2 className='p-2 px-5 bg-holiday-teal text-white rounded-full font-bold shadow-md text-sm md:text-base'>
            👥 Travelers: {trip?.userSelection?.travelers}
          </h2>
        </div>
      </div>
>>>>>>> c46005a (Initialize WanderGen trip planner)
    </div>
    

    </div>
  )
}

<<<<<<< HEAD
export default InfoSection
=======
InfoSection.propTypes = {
  trip: PropTypes.shape({
    userSelection: PropTypes.shape({
      destination: PropTypes.string,
      days: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      budget: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      travelers: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }),
};

export default InfoSection;
>>>>>>> c46005a (Initialize WanderGen trip planner)
