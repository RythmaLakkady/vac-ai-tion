import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Plane, Clock, ExternalLink } from 'lucide-react';
import { convertPrice } from '../../utils/currencyFormatter';

function Flights({ trip, currency, exchangeRates }) {
  const flights = trip?.tripData?.flight_options;

  if (!flights || flights.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="font-serif font-bold text-3xl text-ink mb-6 flex items-center gap-3">
        <Plane className="w-8 h-8 text-amber" /> Flight Options
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {flights.map((flight, idx) => (
          <div key={idx} className="bg-card/60 backdrop-blur-sm rounded-3xl p-6 shadow-sm border-2 border-transparent hover:border-amber transition-all duration-300 flex flex-col h-full">
            <h3 className="font-bold text-xl text-ink font-serif mb-2">{flight.airline}</h3>
            
            <div className="flex items-center gap-4 text-ink/70 mb-4 font-medium text-sm">
              <div className="flex items-center gap-1">
                <span className="text-amber font-bold text-lg">
                  {convertPrice(flight.estimated_price, currency, exchangeRates)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-coral" />
                <span>{flight.duration}</span>
              </div>
            </div>

            {flight.description && (
              <p className="text-sm text-gray-600 mb-6 flex-grow">{flight.description}</p>
            )}

            <Link
              to={flight.booking_url || `https://www.google.com/search?q=${encodeURIComponent(flight.airline + ' book flight')}`}
              target="_blank"
              className="mt-auto w-full py-3 bg-amber/10 text-amber font-bold rounded-xl hover:bg-amber hover:text-primary-foreground transition-colors duration-300 flex items-center justify-center gap-2 text-sm"
            >
              <ExternalLink className="w-4 h-4" /> Check Prices
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

Flights.propTypes = {
  trip: PropTypes.shape({
    tripData: PropTypes.shape({
      flight_options: PropTypes.arrayOf(
        PropTypes.shape({
          airline: PropTypes.string,
          estimated_price: PropTypes.string,
          duration: PropTypes.string,
          booking_url: PropTypes.string,
          description: PropTypes.string,
        })
      ),
    }),
  }),
  currency: PropTypes.string,
  exchangeRates: PropTypes.object,
};

export default Flights;
