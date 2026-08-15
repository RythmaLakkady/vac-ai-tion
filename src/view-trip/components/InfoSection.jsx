import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Share2, Download, CloudSun, Loader2, Coins } from 'lucide-react';
import { toast } from 'sonner';

function InfoSection({trip, currency, setCurrency}) {
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      const destination = trip?.userSelection?.destination;
      if (!destination) return;

      setLoadingWeather(true);
      try {
        // 1. Get coordinates for destination
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1`);
        const geoData = await geoRes.json();
        
        if (geoData.results && geoData.results.length > 0) {
          const { latitude, longitude } = geoData.results[0];
          
          // 2. Get current weather
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const weatherData = await weatherRes.json();
          
          if (weatherData.current_weather) {
            setWeather(weatherData.current_weather);
          }
        }
      } catch (error) {
        console.error("Error fetching weather:", error);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [trip]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Trip link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6'>
      <div className='flex flex-col gap-4 w-full md:flex-1 min-w-0'>
        <h2 className='text-4xl font-bold font-serif text-holiday-dark drop-shadow-sm flex items-start gap-3 break-words'>
          <span className="shrink-0 mt-1">📍</span> <span className="break-words">{trip?.userSelection?.destination || 'No Destination'}</span>
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

      <div className='flex flex-col gap-4 min-w-[200px] shrink-0'>
        <div className='flex justify-end gap-3 no-print'>
          <div className="relative">
            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-holiday-teal pointer-events-none" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 bg-white border border-holiday-teal/20 text-holiday-teal hover:bg-holiday-teal/5 rounded-full font-medium transition-colors shadow-sm outline-none cursor-pointer text-sm"
              title="Select Currency"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="AUD">AUD ($)</option>
              <option value="CAD">CAD ($)</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-holiday-teal text-xs">▼</div>
          </div>

          <button 
            onClick={handleShare}
            className='flex items-center gap-2 px-4 py-2 bg-holiday-teal/10 text-holiday-teal hover:bg-holiday-teal hover:text-white rounded-full font-medium transition-colors shadow-sm'
            title='Share Trip'
          >
            <Share2 className='w-4 h-4' /> Share
          </button>
          <button 
            onClick={handleDownload}
            className='flex items-center gap-2 px-4 py-2 bg-holiday-coral/10 text-holiday-coral hover:bg-holiday-coral hover:text-white rounded-full font-medium transition-colors shadow-sm'
            title='Download PDF'
          >
            <Download className='w-4 h-4' /> PDF
          </button>
        </div>

        <div className='bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-holiday-teal/20 shadow-sm flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <CloudSun className='w-8 h-8 text-holiday-teal' />
            <div>
              <p className='text-xs text-holiday-dark/60 font-semibold uppercase tracking-wider'>Current Weather</p>
              {loadingWeather ? (
                <div className='flex items-center gap-2 mt-1 text-holiday-dark/80'>
                  <Loader2 className='w-4 h-4 animate-spin' /> Loading...
                </div>
              ) : weather ? (
                <p className='text-lg font-bold text-holiday-dark mt-0.5'>
                  {weather.temperature}°C
                </p>
              ) : (
                <p className='text-sm text-holiday-dark/60 mt-0.5'>Not available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

InfoSection.propTypes = {
  trip: PropTypes.shape({
    userSelection: PropTypes.shape({
      destination: PropTypes.string,
      days: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      budget: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      travelers: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }),
  currency: PropTypes.string,
  setCurrency: PropTypes.func,
};

export default InfoSection;
