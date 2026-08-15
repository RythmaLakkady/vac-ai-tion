import { useState, useEffect } from 'react';
import { GrMapLocation } from 'react-icons/gr';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { convertPrice } from '../../utils/currencyFormatter';

function Itinerary({ trip, currency, exchangeRates }) {
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
      </div>
    );
  }

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
                                className="relative grid grid-cols-1 gap-6 font-sans min-h-[50px] pl-4 sm:pl-8 before:content-[''] before:absolute before:left-[11px] sm:before:left-[27px] before:top-4 before:bottom-4 before:w-0.5 before:bg-holiday-teal/20"
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
                                        {/* Timeline Dot */}
                                        <div className="absolute -left-1.5 sm:-left-[5px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-holiday-teal rounded-full shadow-[0_0_0_4px_white] z-10 hidden sm:block"></div>

                                        {/* Drag Handle */}
                                        <div 
                                          {...provided.dragHandleProps}
                                          className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center text-gray-300 hover:text-holiday-teal hover:bg-holiday-teal/5 transition-colors cursor-grab active:cursor-grabbing"
                                        >
                                          <GripVertical className="w-5 h-5 ml-1 sm:ml-0" />
                                        </div>

                                        <div className="pl-6 flex-grow flex flex-col justify-center">
                                          {activity?.place_name && (
                                            <div className="flex items-center gap-3 mb-1">
                                              <h5 className="text-xl font-bold font-serif text-holiday-dark">
                                                {activity?.place_name}
                                              </h5>
                                              {activity?.is_saved_note && (
                                                <span className="text-xs font-bold bg-holiday-teal/10 text-holiday-teal px-2 py-1 rounded-md border border-holiday-teal/20 whitespace-nowrap shadow-sm">
                                                  📌 Saved Note
                                                </span>
                                              )}
                                            </div>
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
                                                💳 {convertPrice(activity?.ticket_pricing, currency, exchangeRates)}
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
                                          <Link
                                            to={activity?.booking_url || `https://www.google.com/search?q=${encodeURIComponent((activity?.place_name || '') + ' official website tickets booking')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-holiday-coral/10 text-holiday-coral hover:bg-holiday-coral hover:text-white rounded-full transition-colors flex items-center justify-center"
                                            title={activity?.booking_url ? "Book / Website" : "Search Booking"}
                                          >
                                            <ExternalLink className="w-5 h-5" />
                                          </Link>
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
                                          <button onClick={() => handleDelete(dayIndex, idx)} className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors flex items-center justify-center" title="Delete Activity">
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
    </div>
  );
}

  trip: PropTypes.shape({
    tripData: PropTypes.shape({
      itinerary: PropTypes.array,
    }),
  }),
  currency: PropTypes.string,
  exchangeRates: PropTypes.object,
};

export default Itinerary;
