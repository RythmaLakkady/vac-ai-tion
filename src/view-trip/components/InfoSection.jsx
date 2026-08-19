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
        <h2 className='text-4xl font-bold font-serif text-ink drop-shadow-sm flex items-start gap-3 break-words'>
          <span className="shrink-0 mt-1">📍</span> <span className="break-words">{trip?.userSelection?.destination || 'No Destination'}</span>
        </h2>

        <div className='flex flex-wrap gap-3 mt-2'>
          <h2 className='p-2 px-5 bg-amber/10 text-amber rounded-full font-bold shadow-sm border border-amber/20 text-sm'>
            📅 {trip?.userSelection?.days} {trip?.userSelection?.days === "1" ? "Day" : "Days"}
          </h2>
          {trip?.userSelection?.season && trip?.userSelection?.season !== "Not specified" && (
            <h2 className='p-2 px-5 bg-amber/10 text-amber rounded-full font-bold shadow-sm border border-amber/20 text-sm'>
              🌤️ {trip?.userSelection?.season}
            </h2>
          )}
          <h2 className='p-2 px-5 bg-coral/10 text-coral rounded-full font-bold shadow-sm border border-coral/20 text-sm'>
            💰 {trip?.userSelection?.budget}
          </h2>
          <h2 className='p-2 px-5 bg-coral/10 text-coral rounded-full font-bold shadow-sm border border-coral/20 text-sm'>
            👥 {trip?.userSelection?.travelers}
          </h2>
          {trip?.userSelection?.travelStyle && (
            <h2 className='p-2 px-5 bg-indigo-500/10 text-indigo-600 rounded-full font-bold shadow-sm border border-indigo-500/20 text-sm max-w-xs truncate' title={trip?.userSelection?.travelStyle}>
              ✨ {trip?.userSelection?.travelStyle}
            </h2>
          )}
          {trip?.userSelection?.foodPreferences && trip?.userSelection?.foodPreferences !== "No Restrictions" && (
            <h2 className='p-2 px-5 bg-emerald-500/10 text-emerald-600 rounded-full font-bold shadow-sm border border-emerald-500/20 text-sm max-w-xs truncate' title={trip?.userSelection?.foodPreferences}>
              🍽️ {trip?.userSelection?.foodPreferences}
            </h2>
          )}
        </div>
      </div>

      <div className='flex flex-col gap-4 min-w-[200px] shrink-0'>
        <div className='flex justify-end gap-3 no-print'>
          <div className="relative">
            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber pointer-events-none" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 bg-card border border-amber/20 text-amber hover:bg-amber/5 rounded-full font-medium transition-colors shadow-sm outline-none cursor-pointer text-sm"
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
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-amber text-xs">▼</div>
          </div>

          <button 
            onClick={handleShare}
            className='flex items-center gap-2 px-4 py-2 bg-amber/10 text-amber hover:bg-amber hover:text-primary-foreground rounded-full font-medium transition-colors shadow-sm'
            title='Share Trip'
          >
            <Share2 className='w-4 h-4' /> Share
          </button>
          <button 
            onClick={handleDownload}
            className='flex items-center gap-2 px-4 py-2 bg-coral/10 text-coral hover:bg-coral hover:text-primary-foreground rounded-full font-medium transition-colors shadow-sm'
            title='Download PDF'
          >
            <Download className='w-4 h-4' /> PDF
          </button>
        </div>

        <div className='bg-card/50 backdrop-blur-md rounded-2xl p-4 border border-amber/20 shadow-sm flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <CloudSun className='w-8 h-8 text-amber' />
            <div>
              <p className='text-xs text-ink/60 font-semibold uppercase tracking-wider'>Current Weather</p>
              {loadingWeather ? (
                <div className='flex items-center gap-2 mt-1 text-ink/80'>
                  <Loader2 className='w-4 h-4 animate-spin' /> Loading...
                </div>
              ) : weather ? (
                <p className='text-lg font-bold text-ink mt-0.5'>
                  {weather.temperature}°C
                </p>
              ) : (
                <p className='text-sm text-ink/60 mt-0.5'>Not available</p>
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
