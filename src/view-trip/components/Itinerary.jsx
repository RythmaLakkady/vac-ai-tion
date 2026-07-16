<<<<<<< HEAD
import React from 'react';
import { GrMapLocation } from 'react-icons/gr';
import { Link } from 'react-router-dom';

function Itinerary({ trip }) {
  const itinerary = trip?.tripData?.itinerary;

  if (!itinerary || typeof itinerary !== 'object') {
    return (
      <div>
        <p>Itinerary is not available or in the expected format.</p>
=======
import { useState, useEffect } from 'react';
import { GrMapLocation } from 'react-icons/gr';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash2, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

function Itinerary({ trip }) {
  const [itinerary, setItinerary] = useState([]);

  useEffect(() => {
    if (trip?.tripData?.itinerary && Array.isArray(trip.tripData.itinerary)) {
      setItinerary(trip.tripData.itinerary);
    }
  }, [trip]);

  if (!itinerary || itinerary.length === 0) {
    return (
      <div>
        <p className="text-gray-500 font-sans">Itinerary is not available or in the expected format.</p>
>>>>>>> c46005a (Initialize WanderGen trip planner)
      </div>
    );
  }

<<<<<<< HEAD
  const sortedDays = Object.keys(itinerary)
    .sort((a, b) => {
      const dayA = parseInt(a.replace('day', ''));
      const dayB = parseInt(b.replace('day', ''));
      return dayA - dayB;
    })
    .map((dayKey) => itinerary[dayKey]);

  return (
    <div className="px-4 md:px-8">
      <h2 className="text-2xl font-serif font-semibold text-gray-800 mt-6 mb-4 ml-2 mr-2">
        Places to Visit
      </h2>

      <div>
        {sortedDays.map((day, index) => (
          <div key={index} className="my-6 ml-2 mr-2">
            <h3 className="text-xl font-serif font-semibold text-gray-700">
              {`Day ${index + 1}: ${day?.theme || "No Theme"}`}
              {day?.best_time && day?.best_time !== "N/A" && (
                <span className="text-sm text-gray-600 ml-2">🌅|🌃 Best Time: {day?.best_time}</span>
              )}
            </h3>

            {day?.map && (
              <div className="my-4">
                <h4 className="text-lg font-serif font-medium text-gray-700">Map 📍</h4>
                <iframe
                  src={day?.map}
                  width="100%"
                  height="400"
                  frameBorder="0"
                  allowFullScreen
                  className="rounded-xl"
                ></iframe>
              </div>
            )}

            {Array.isArray(day?.activities) && day?.activities.length > 0 && (
              <div>
                <h4 className="text-lg font-serif font-medium text-gray-700 mt-4">Activities</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {day?.activities.map((activity, idx) => (
                    <div
                      key={idx}
                      className="my-4 shadow-md hover:scale-105 transition-all cursor-pointer flex flex-col"
                    >
                      <div className="mt-3 ml-2 mr-2">
                        {activity?.place_name && (
                          <h5 className="text-md font-serif font-semibold text-gray-700">
                            {activity?.place_name}
                          </h5>
                        )}
                        {activity?.place_details && (
                          <p className="text-sm text-gray-600">{activity?.place_details} </p>
                        )}
                        {activity?.rating && activity?.rating !== "N/A" && (
                          <p className="text-sm text-gray-600">⭐ {activity?.rating}</p>
                        )}
                        {activity?.ticket_pricing && activity?.ticket_pricing !== "N/A" && (
                          <p className="text-sm text-gray-600">💸 {activity?.ticket_pricing}</p>
                        )}
                        {activity?.time_travel && activity?.time_travel !== "N/A" && (
                          <p className="text-sm text-gray-600">⏱️ {activity?.time_travel}</p>
                        )}

                        {activity?.geo_coordinates && (
                          <Link
                            to={`https://www.google.com/maps/search/?api=1&query=${activity?.geo_coordinates.latitude},${activity?.geo_coordinates.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 text-[#FD9C7E] hover:text-[#7AB9B3]"
                          >
                            <GrMapLocation className="mr-1" /> View on Map
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
=======
  const handleDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return;
    }

    const newItinerary = [...itinerary];

    if (type === 'day') {
      const [reorderedDay] = newItinerary.splice(source.index, 1);
      newItinerary.splice(destination.index, 0, reorderedDay);
      setItinerary(newItinerary);
      return;
    }

    // type === 'activity'
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

  const handleDelete = (dayIdx, activityIdx) => {
    const newItinerary = [...itinerary];
    newItinerary[dayIdx].activities.splice(activityIdx, 1);
    
    // Auto-delete day if empty
    const filteredItinerary = newItinerary.filter(day => day.activities && day.activities.length > 0);
    setItinerary(filteredItinerary);
  };

  const handleDeleteDay = (dayIdx) => {
    const newItinerary = [...itinerary];
    newItinerary.splice(dayIdx, 1);
    setItinerary(newItinerary);
  };

  return (
    <div className="mt-12">
      <h2 className="text-4xl font-bold font-serif text-holiday-dark mb-10 tracking-tight">
        Your Itinerary
      </h2>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-days" type="day">
          {(provided) => (
            <div className="space-y-16" {...provided.droppableProps} ref={provided.innerRef}>
              {itinerary.map((day, dayIndex) => (
                <Draggable key={`day-${dayIndex}`} draggableId={`day-${dayIndex}`} index={dayIndex}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-white/70 backdrop-blur-2xl p-8 rounded-[32px] border ${snapshot.isDragging ? 'shadow-2xl border-holiday-teal z-50' : 'shadow-sm border-gray-100 hover:border-holiday-teal/50 hover:shadow-md'} ${snapshot.isDragging ? '' : 'transition-colors transition-shadow duration-300'}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
                        <div {...provided.dragHandleProps} className="text-gray-400 hover:text-holiday-teal cursor-grab active:cursor-grabbing p-2 -ml-4" title="Drag to reorder day">
                          <GripVertical className="w-6 h-6" />
                        </div>
                        <span className="bg-holiday-coral text-white px-5 py-2 rounded-full font-bold shadow-md text-lg font-sans whitespace-nowrap">
                          Day {dayIndex + 1}
                        </span> 
                        <h3 className="text-2xl font-bold font-serif text-holiday-dark">{day?.theme || "Exploration"}</h3>
                        <div className="flex items-center gap-2 md:ml-auto">
                          {day?.best_time && day?.best_time !== "N/A" && (
                            <span className="text-sm text-holiday-dark/70 font-medium font-sans flex items-center gap-2 bg-holiday-teal/10 px-4 py-2 rounded-full">
                              🕒 Best Time: {day?.best_time}
                            </span>
                          )}
                          <button 
                            onClick={() => handleDeleteDay(dayIndex)} 
                            className="p-2 bg-holiday-coral/10 text-holiday-coral hover:bg-holiday-coral hover:text-white rounded-full transition-colors flex items-center justify-center" 
                            title="Delete Entire Day"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {day?.map && (
                        <div className="mb-10">
                          <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
                            <iframe
                              src={day?.map}
                              width="100%"
                              height="300"
                              frameBorder="0"
                              allowFullScreen
                              className="w-full grayscale hover:grayscale-0 transition-all duration-700 opacity-90 hover:opacity-100"
                            ></iframe>
                          </div>
                        </div>
                      )}

                      {Array.isArray(day?.activities) && (
                        <div>
                          <h4 className="text-xl font-bold font-serif text-holiday-dark mb-6 flex items-center gap-2">
                            Activities
                            <span className="text-sm font-normal text-holiday-dark/50 bg-gray-100 px-3 py-1 rounded-full font-sans">Drag to reorder</span>
                          </h4>
                          
                          <Droppable droppableId={`day-${dayIndex}`} type="activity">
                            {(provided) => (
                              <div 
                                className="grid grid-cols-1 gap-4 font-sans min-h-[50px]"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {day?.activities.map((activity, idx) => (
                                  <Draggable key={`act-${dayIndex}-${idx}`} draggableId={`act-${dayIndex}-${idx}`} index={idx}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`group p-6 bg-white rounded-2xl border flex flex-col sm:flex-row gap-6 relative overflow-hidden ${snapshot.isDragging ? 'shadow-2xl border-holiday-teal z-[60]' : 'shadow-sm border-gray-100 hover:border-holiday-teal/50 hover:shadow-md'} ${snapshot.isDragging ? '' : 'transition-colors transition-shadow duration-300'}`}
                                      >
                                        {/* Drag Handle */}
                                        <div 
                                          {...provided.dragHandleProps}
                                          className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center text-gray-300 hover:text-holiday-teal hover:bg-holiday-teal/5 transition-colors cursor-grab active:cursor-grabbing"
                                        >
                                          <GripVertical className="w-5 h-5" />
                                        </div>

                                        <div className="pl-6 flex-grow flex flex-col justify-center">
                                          {activity?.place_name && (
                                            <h5 className="text-xl font-bold font-serif text-holiday-dark mb-1">
                                              {activity?.place_name}
                                            </h5>
                                          )}
                                          {activity?.place_details && (
                                            <p className="text-holiday-dark/60 text-sm mb-4 leading-relaxed max-w-3xl">{activity?.place_details}</p>
                                          )}
                                          
                                          <div className="flex flex-wrap items-center gap-4 mt-auto text-sm font-medium text-holiday-dark/80">
                                            {activity?.rating && activity?.rating !== "N/A" && (
                                              <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full border border-yellow-100">
                                                ⭐ {activity?.rating}
                                              </span>
                                            )}
                                            {activity?.ticket_pricing && activity?.ticket_pricing !== "N/A" && (
                                              <span className="flex items-center gap-1.5 bg-holiday-teal/10 text-holiday-teal px-3 py-1 rounded-full border border-holiday-teal/20">
                                                💳 {activity?.ticket_pricing}
                                              </span>
                                            )}
                                            {activity?.time_travel && activity?.time_travel !== "N/A" && (
                                              <span className="flex items-center gap-1.5 bg-holiday-coral/10 text-holiday-coral px-3 py-1 rounded-full border border-holiday-coral/20">
                                                ⏱️ {activity?.time_travel}
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Actions & Map Link */}
                                        <div className="pl-6 sm:pl-0 sm:ml-auto flex sm:flex-col items-center justify-center gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                          {activity?.geo_coordinates && (
                                            <Link
                                              to={`https://www.google.com/maps/search/?api=1&query=${activity?.geo_coordinates.latitude},${activity?.geo_coordinates.longitude}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-3 bg-holiday-teal/10 text-holiday-teal hover:bg-holiday-teal hover:text-white rounded-full transition-colors flex items-center justify-center"
                                              title="View on Map"
                                            >
                                              <GrMapLocation className="text-xl" />
                                            </Link>
                                          )}
                                          <button onClick={() => handleDelete(dayIndex, idx)} className="p-3 bg-holiday-coral/10 text-holiday-coral hover:bg-holiday-coral hover:text-white rounded-full transition-colors flex items-center justify-center" title="Delete Activity">
                                            <Trash2 className="w-5 h-5" />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
>>>>>>> c46005a (Initialize WanderGen trip planner)
    </div>
  );
}

<<<<<<< HEAD
=======
Itinerary.propTypes = {
  trip: PropTypes.shape({
    tripData: PropTypes.shape({
      itinerary: PropTypes.array,
    }),
  }),
};

>>>>>>> c46005a (Initialize WanderGen trip planner)
export default Itinerary;
