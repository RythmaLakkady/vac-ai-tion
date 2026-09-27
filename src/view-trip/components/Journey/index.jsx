import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Map as MapIcon, X } from 'lucide-react';
import JourneyIntro from './JourneyIntro';
import JourneyChapter from './JourneyChapter';
import TripMap from './TripMap';
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function Journey({ trip, tripId, itinerary, setItinerary }) {
  const [selectedStopId, setSelectedStopId] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [showMobileMap, setShowMobileMap] = useState(false);

  const saveItinerary = async (newItinerary) => {
    setItinerary(newItinerary);
    if (!tripId) return;
    try {
      const docRef = doc(db, 'UserTrips', tripId);
      await updateDoc(docRef, {
        'tripData.itinerary': newItinerary
      });
    } catch (e) {
      console.error("Failed to persist itinerary updates", e);
      toast.error('Failed to save changes to cloud');
    }
  };

  if (!trip && !itinerary) {
    return (
      <div className="max-w-4xl mx-auto pb-24 animate-pulse">
        <div className="py-12 border-b border-border/50 mb-12">
          <div className="h-16 w-64 bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-6 w-48 bg-gray-100 rounded-md mb-4"></div>
          <div className="h-4 w-full max-w-md bg-gray-100 rounded-md"></div>
        </div>
        <div className="mb-16 pt-8">
          <div className="h-4 w-16 bg-amber/20 rounded-md mb-2"></div>
          <div className="h-10 w-48 bg-gray-200 rounded-xl mb-8"></div>
          <div className="flex items-start gap-6 mb-4">
            <div className="w-4 h-4 rounded-full bg-gray-200 shrink-0"></div>
            <div className="flex-1 h-24 bg-gray-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-gray-50">
        <p className="text-lg text-ink/50 font-medium">Your journey has no stops yet. Add an activity to begin.</p>
      </div>
    );
  }

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return;
    }

    const newItinerary = [...itinerary];
    const sourceDayIdx = parseInt(source.droppableId.replace('day-', ''));
    const destDayIdx = parseInt(destination.droppableId.replace('day-', ''));
    
    const sourceActivities = Array.from(newItinerary[sourceDayIdx].activities || []);
    const [movedActivity] = sourceActivities.splice(source.index, 1);
    
    if (sourceDayIdx === destDayIdx) {
      sourceActivities.splice(destination.index, 0, movedActivity);
      newItinerary[sourceDayIdx].activities = sourceActivities;
    } else {
      const destActivities = Array.from(newItinerary[destDayIdx].activities || []);
      destActivities.splice(destination.index, 0, movedActivity);
      newItinerary[sourceDayIdx].activities = sourceActivities;
      newItinerary[destDayIdx].activities = destActivities;
    }
    
    const filteredItinerary = newItinerary.filter(day => day.activities && day.activities.length > 0);
    saveItinerary(filteredItinerary);
  };

  const handleDeleteStop = (dayIndex, activityIndex) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].activities.splice(activityIndex, 1);
    const filteredItinerary = newItinerary.filter(day => day.activities && day.activities.length > 0);
    saveItinerary(filteredItinerary);
  };

  const handleAddStop = (dayIndex) => {
    const newItinerary = [...itinerary];
    const newStop = {
      place_name: "New Stop",
      category: "Activity",
      time_travel: "TBD",
      place_details: "Added manually",
    };
    newItinerary[dayIndex].activities.push(newStop);
    saveItinerary(newItinerary);
  };

  const handleEditStop = (dayIndex, activityIndex, newActivityData) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].activities[activityIndex] = {
      ...newItinerary[dayIndex].activities[activityIndex],
      ...newActivityData
    };
    saveItinerary(newItinerary);
  };

  const handleInsertStop = (dayIndex, insertAfterIndex, newActivityData) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].activities.splice(insertAfterIndex + 1, 0, newActivityData);
    saveItinerary(newItinerary);
  };

  const handleReplaceStop = (dayIndex, activityIndex, newActivityData) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].activities[activityIndex] = {
      ...newItinerary[dayIndex].activities[activityIndex],
      ...newActivityData
    };
    saveItinerary(newItinerary);
  };

  const handleMapStopSelected = (stopId, dayIndex) => {
    setSelectedStopId(stopId);
    setSelectedDayIndex(dayIndex);
    
    if (window.innerWidth < 1024) {
      setShowMobileMap(false);
    }
    
    setTimeout(() => {
      const el = document.getElementById(stopId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleJourneyStopSelected = (stopId, dayIndex) => {
    setSelectedStopId(stopId);
    setSelectedDayIndex(dayIndex);
  };

  return (
    <div className="w-full pb-24 relative">
      <div className="max-w-4xl mx-auto mb-8">
        <JourneyIntro trip={trip} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        {/* Left Column: Journey Timeline */}
        <div className="lg:col-span-5 xl:col-span-6 order-2 lg:order-1">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="space-y-4">
              {itinerary.map((day, idx) => (
                <JourneyChapter 
                  key={`day-${idx}`} 
                  trip={trip}
                  day={day} 
                  dayIndex={idx} 
                  onDeleteStop={handleDeleteStop}
                  onAddStop={handleAddStop}
                  onEditStop={handleEditStop}
                  onInsertStop={handleInsertStop}
                  onReplaceStop={handleReplaceStop}
                  onSelectStop={handleJourneyStopSelected}
                  selectedStopId={selectedStopId}
                />
              ))}
            </div>
          </DragDropContext>
          <div className="mt-16 pt-8 border-t border-border/50 text-center">
            <span className="text-sm font-bold tracking-widest text-ink/30 uppercase">End of Journey</span>
          </div>
        </div>

        {/* Right Column: Trip Map */}
        <div className={`lg:col-span-7 xl:col-span-6 order-1 lg:order-2 ${showMobileMap ? 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4' : 'hidden lg:block'}`}>
          <div className={`w-full ${showMobileMap ? 'h-full mt-16 shadow-2xl rounded-3xl overflow-hidden' : 'h-[calc(100vh-160px)] sticky top-28'}`}>
            <TripMap 
              itinerary={itinerary} 
              selectedStopId={selectedStopId}
              selectedDayIndex={selectedDayIndex}
              onStopSelected={handleMapStopSelected} 
            />
          </div>
          {showMobileMap && (
            <button 
              onClick={() => setShowMobileMap(false)}
              className="absolute top-6 right-6 p-3 bg-white rounded-full shadow-lg text-ink hover:bg-gray-50 z-[9999]"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Map Toggle */}
      <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={() => setShowMobileMap(true)}
          className="flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-full shadow-2xl font-medium text-sm hover:scale-105 transition-transform border border-white/20"
        >
          <MapIcon className="w-4 h-4" /> View Map
        </button>
      </div>
    </div>
  );
}
