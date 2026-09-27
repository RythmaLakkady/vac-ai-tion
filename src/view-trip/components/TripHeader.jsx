import { Users, Calendar, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TripHeader({ trip, currency, setCurrency }) {
  const tripData = trip?.tripData || {};
  const userSelection = trip?.userSelection || {};
  
  const destination = userSelection.destination || tripData.location || "Unknown Destination";
  const duration = userSelection.days || tripData.duration || "N/A";
  const travelers = userSelection.travelers || tripData.travelers || "N/A";
  const budget = userSelection.budget || "N/A";

  const destName = destination.split(',')[0];

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full font-sans">
      <div>
        <h1 className="text-5xl md:text-6xl font-black font-serif tracking-tight text-ink uppercase">
          {destName}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-4 text-ink/70 font-semibold text-sm sm:text-base">
          <span className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border shadow-sm">
            <Calendar className="w-5 h-5 text-coral" />
            {duration} Days
          </span>
          <span className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border shadow-sm">
            <Users className="w-5 h-5 text-amber" />
            {travelers}
          </span>
          <span className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border shadow-sm">
            <Wallet className="w-5 h-5 text-green-500" />
            Budget: {budget}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-4 w-full md:w-auto">
        <select 
          value={currency} 
          onChange={(e) => setCurrency(e.target.value)}
          className="bg-card text-ink font-bold px-4 py-2 rounded-xl border border-border shadow-sm focus:outline-none focus:border-amber cursor-pointer"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="INR">INR (₹)</option>
          <option value="JPY">JPY (¥)</option>
          <option value="AUD">AUD ($)</option>
          <option value="CAD">CAD ($)</option>
        </select>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none border-ink/20 font-bold hover:bg-ink hover:text-primary-foreground rounded-full">
            Edit Trip
          </Button>
          <Button className="flex-1 md:flex-none bg-ink text-primary-foreground font-bold hover:bg-amber rounded-full shadow-lg">
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
