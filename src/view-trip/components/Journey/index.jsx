import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import JourneyIntro from './JourneyIntro';
import JourneyChapter from './JourneyChapter';

export default function Journey({ trip, itinerary, setItinerary }) {
  if (!trip && !itinerary) {
    // Loading State
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
    // Empty State
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
    
    // Auto-delete days that have no activities left
    const filteredItinerary = newItinerary.filter(day => day.activities && day.activities.length > 0);
    setItinerary(filteredItinerary);
  };

  const handleDeleteStop = (dayIndex, activityIndex) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].activities.splice(activityIndex, 1);
    const filteredItinerary = newItinerary.filter(day => day.activities && day.activities.length > 0);
    setItinerary(filteredItinerary);
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
    setItinerary(newItinerary);
  };

  const handleEditStop = (dayIndex, activityIndex, newActivityData) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIndex].activities[activityIndex] = {
      ...newItinerary[dayIndex].activities[activityIndex],
      ...newActivityData
    };
    setItinerary(newItinerary);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <JourneyIntro trip={trip} />
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          {itinerary.map((day, idx) => (
            <JourneyChapter 
              key={`day-${idx}`} 
              day={day} 
              dayIndex={idx} 
              onDeleteStop={handleDeleteStop}
              onAddStop={handleAddStop}
              onEditStop={handleEditStop}
            />
          ))}
        </div>
      </DragDropContext>
      
      <div className="mt-16 pt-8 border-t border-border/50 text-center">
        <span className="text-sm font-bold tracking-widest text-ink/30 uppercase">End of Journey</span>
      </div>
    </div>
  );
}
