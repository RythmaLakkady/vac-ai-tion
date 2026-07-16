import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ExternalLink, MapPin } from 'lucide-react';

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
            <div
              key={index}
              className="flex flex-col h-full bg-white/60 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg border-2 border-transparent hover:border-holiday-teal transition-all duration-300"
            >
              {/* Hotel Information Section */}
              <div className="p-6 flex flex-col justify-between flex-grow gap-2 font-sans text-holiday-dark">
                <h3 className="font-bold text-xl line-clamp-1 drop-shadow-sm font-serif">
                  {hotel?.hotel_name || 'Hotel Name Unavailable'}
                </h3>
                <p className="text-sm text-holiday-dark/70 font-medium line-clamp-2 mt-1 flex items-start gap-1">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> 
                  <span>{hotel?.address || 'Address Unavailable'}</span>
                </p>
                <div className="flex justify-between items-center mt-2 mb-2">
                  <p className="font-bold text-lg text-holiday-teal line-clamp-1 flex-1">
                    {hotel?.price || 'Price Unavailable'}
                  </p>
                  <p className="font-bold bg-holiday-coral/20 text-holiday-coral px-3 py-1 rounded-full text-sm shrink-0 ml-2">
                    ⭐ {hotel?.rating || 'N/A'}
                  </p>
                </div>
                
                {hotel?.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {hotel.description}
                  </p>
                )}

                <div className="mt-auto flex flex-col gap-2 pt-2">
                  <Link
                    to={hotel?.booking_url || `https://www.google.com/search?q=${encodeURIComponent((hotel?.hotel_name || '') + ' ' + (hotel?.address || '') + ' official website booking')}`}
                    target="_blank"
                    className="w-full py-2.5 bg-holiday-teal text-white font-bold rounded-xl hover:bg-holiday-teal/90 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <ExternalLink className="w-4 h-4" /> {hotel?.booking_url ? 'Book Now' : 'Search Booking'}
                  </Link>
                  <Link
                    to={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      hotel?.hotel_name || ''
                    )} ${encodeURIComponent(hotel?.address || '')}`}
                    target="_blank"
                    className="w-full py-2.5 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm bg-holiday-dark/5 text-holiday-dark hover:bg-holiday-dark/10"
                  >
                    <MapPin className="w-4 h-4" /> View on Map
                  </Link>
                </div>
              </div>
            </div>
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
          description: PropTypes.string,
          booking_url: PropTypes.string,
        })
      ),
    }),
  }),
};

export default Hotels;
