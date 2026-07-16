<<<<<<< HEAD
import React from 'react'
import { Link } from 'react-router-dom'

function Hotels({ trip }) {
  return (
    <div>
      <h2 className='font-semibold font-serif text-2xl mt-10'>Hotel Recommendations</h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7'>
        {trip?.tripData?.hotel_options?.map((hotel, index) => (
          <Link
            to={'https://www.google.com/maps/search/?api=1&query=' + hotel?.hotel_name + " " + hotel?.address}
            target='_blank'
            key={index}
            aria-label={`View ${hotel?.hotel_name} on Google Maps`}
          >
            <div className='my-5 shadow-lg hover:scale-105 transition-all cursor-pointer'>
              <div className='flex flex-col h-full bg-white rounded-lg overflow-hidden'>
                
                {/* Hotel Information Section */}
                <div className='p-6 flex flex-col justify-between flex-grow'>
                  <h2 className='font-semibold text-xl text-gray-800 truncate'>{hotel?.hotel_name}</h2>
                  <p className='text-sm text-gray-600 truncate'>📍 {hotel?.address}</p>
                  <p className='text-sm font-medium text-gray-700 mt-1'>💰 {hotel?.price}</p>
                  <p className='text-sm font-medium text-gray-700 mt-1'>⭐ {hotel?.rating}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Hotels
=======
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function Hotels({ trip }) {
  const hotels = trip?.tripData?.hotel_options;

  return (
    <div>
      <h2 className="font-serif font-bold text-3xl text-holiday-dark mb-6">Hotel Recommendations</h2>

      {/* If no hotels are available */}
      {!hotels || hotels.length === 0 ? (
        <p className="text-holiday-dark opacity-60 mt-4 font-serif text-lg">No hotel recommendations available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {hotels.map((hotel, index) => (
            <Link
              to={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                hotel?.hotel_name || ''
              )} ${encodeURIComponent(hotel?.address || '')}`}
              target="_blank"
              key={index}
              aria-label={`View ${hotel?.hotel_name || 'this hotel'} on Google Maps`}
              className="block hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="flex flex-col h-full bg-white/60 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg border-2 border-transparent hover:border-holiday-teal">
                {/* Hotel Information Section */}
                <div className="p-6 flex flex-col justify-between flex-grow gap-2 font-serif text-holiday-dark">
                  <h3 className="font-bold text-xl line-clamp-1 drop-shadow-sm">
                    {hotel?.hotel_name || 'Hotel Name Unavailable'}
                  </h3>
                  <p className="text-sm opacity-80 line-clamp-2 mt-1">
                    📍 {hotel?.address || 'Address Unavailable'}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <p className="font-bold text-lg text-holiday-teal">
                      {hotel?.price || 'Price Unavailable'}
                    </p>
                    <p className="font-bold bg-holiday-coral/20 text-holiday-coral px-3 py-1 rounded-full text-sm">
                      ⭐ {hotel?.rating || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
Hotels.propTypes = {
  trip: PropTypes.shape({
    tripData: PropTypes.shape({
      hotel_options: PropTypes.arrayOf(
        PropTypes.shape({
          hotel_name: PropTypes.string,
          address: PropTypes.string,
          price: PropTypes.string,
          rating: PropTypes.string,
        })
      ),
    }),
  }),
};

export default Hotels;
>>>>>>> c46005a (Initialize WanderGen trip planner)
