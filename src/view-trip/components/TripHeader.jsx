import { Users, Calendar, Wallet, Share2, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { nanoid } from 'nanoid';
import { doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { toast } from 'sonner';
import { analytics } from '@/service/analyticsService';
import { Cloud, CloudFog, CloudLightning } from 'lucide-react';

export default function TripHeader({ trip, tripId, currency, setCurrency, isReadOnly = false, saveState = 'saved' }) {
  const tripData = trip?.tripData || {};
  const userSelection = trip?.userSelection || {};
  
  const destination = userSelection.destination || tripData.location || "Unknown Destination";
  const duration = userSelection.days || tripData.duration || "N/A";
  const travelers = userSelection.travelers || tripData.travelers || "N/A";
  const budget = userSelection.budget || "N/A";

  const destName = destination.split(',')[0];

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [localShareId, setLocalShareId] = useState(trip?.shareId || null);

  const handleShareClick = () => {
    setIsShareModalOpen(true);
    analytics.trackEvent('trip_share_opened', { tripId });
  };

  const enableSharing = async () => {
    try {
      setShareLoading(true);
      const newShareId = nanoid(10);
      
      // Create public document
      await setDoc(doc(db, 'SharedTrips', newShareId), {
        tripId: tripId,
        tripData: trip.tripData,
        userSelection: trip.userSelection,
        sharedAt: new Date().toISOString()
      });

      // Update UserTrip
      await updateDoc(doc(db, 'UserTrips', tripId), {
        shareId: newShareId
      });

      trip.shareId = newShareId;
      setLocalShareId(newShareId);
      toast.success('Sharing enabled!');
      analytics.trackEvent('trip_share_enabled', { tripId, shareId: newShareId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to enable sharing');
    } finally {
      setShareLoading(false);
    }
  };

  const disableSharing = async () => {
    if (!localShareId) return;
    try {
      setShareLoading(true);
      await deleteDoc(doc(db, 'SharedTrips', localShareId));
      await updateDoc(doc(db, 'UserTrips', tripId), {
        shareId: null
      });
      const oldShareId = localShareId;
      trip.shareId = null;
      setLocalShareId(null);
      toast.success('Sharing disabled');
      analytics.trackEvent('trip_share_disabled', { tripId, shareId: oldShareId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to disable sharing');
    } finally {
      setShareLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/v/${localShareId}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
    analytics.trackEvent('trip_share_link_copied', { tripId, shareId: localShareId });
  };

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
          {!isReadOnly && (
            <span className="flex items-center gap-2 px-3 py-1.5 ml-2 text-xs font-semibold text-gray-400">
              {saveState === 'saved' && <><Cloud className="w-4 h-4 text-green-500" /> Saved to cloud</>}
              {saveState === 'saving' && <><CloudFog className="w-4 h-4 text-amber animate-pulse" /> Saving...</>}
              {saveState === 'error' && <><CloudLightning className="w-4 h-4 text-red-500" /> Save failed</>}
            </span>
          )}
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
          {!isReadOnly && (
            <>
              <Button variant="outline" className="flex-1 md:flex-none border-ink/20 font-bold hover:bg-ink hover:text-primary-foreground rounded-full">
                Edit Trip
              </Button>
              <Button onClick={handleShareClick} className="flex-1 md:flex-none bg-ink text-primary-foreground font-bold hover:bg-amber rounded-full shadow-lg gap-2">
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-[32px] p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsShareModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-ink">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-bold font-serif text-ink mb-2">Share Trip</h2>
            <p className="text-gray-500 mb-8 font-medium">Allow anyone with the link to view a read-only version of your itinerary.</p>
            
            {localShareId ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 bg-gray-50 border border-border p-2 rounded-xl">
                  <input 
                    type="text" 
                    readOnly 
                    value={`${window.location.origin}/v/${localShareId}`} 
                    className="flex-1 bg-transparent px-2 outline-none text-ink text-sm font-medium"
                  />
                  <Button onClick={copyLink} className="bg-amber hover:bg-amber/90 text-white rounded-lg px-4 font-bold shrink-0">
                    <Copy className="w-4 h-4 mr-2" /> Copy
                  </Button>
                </div>
                <Button 
                  onClick={disableSharing} 
                  disabled={shareLoading}
                  variant="outline" 
                  className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold rounded-xl"
                >
                  {shareLoading ? 'Disabling...' : 'Disable sharing'}
                </Button>
              </div>
            ) : (
              <Button 
                onClick={enableSharing} 
                disabled={shareLoading}
                className="w-full py-6 bg-ink text-white hover:bg-amber rounded-2xl font-bold text-lg transition-colors"
              >
                {shareLoading ? 'Enabling...' : 'Enable public link'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
