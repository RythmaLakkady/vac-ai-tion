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
                      className={`bg-white/80 backdrop-blur-3xl p-6 sm:p-10 rounded-[40px] border border-white/50 relative overflow-hidden ${snapshot.isDragging ? 'shadow-[0_30px_60px_-15px_rgba(90,161,150,0.4)] border-holiday-teal z-50' : 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500'}`}
                    >
                      {/* Subtle background decoration */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-holiday-teal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10 relative z-10">
                        <div {...provided.dragHandleProps} className="text-gray-300 hover:text-holiday-teal cursor-grab active:cursor-grabbing p-2 -ml-4" title="Drag to reorder day">
                          <GripVertical className="w-7 h-7" />
                        </div>
                        <span className="bg-gradient-to-br from-holiday-coral to-pink-500 text-white px-6 py-2 rounded-full font-bold shadow-[0_4px_14px_0_rgba(242,135,116,0.39)] text-lg font-sans whitespace-nowrap">
                          Day {dayIndex + 1}
                        </span> 
                        <h3 className="text-3xl font-bold font-serif text-holiday-dark ml-2">{day?.theme || "Exploration Day"}</h3>
                        <div className="flex flex-wrap items-center gap-3 md:ml-auto">
                          <span className="text-sm text-holiday-dark/80 font-semibold font-sans flex items-center gap-2 bg-holiday-teal/15 px-4 py-2.5 rounded-full backdrop-blur-sm border border-holiday-teal/20 shadow-sm">
                            🕒 {day?.best_time && day.best_time !== "N/A" ? day.best_time : "Anytime"}
                          </span>
                          <button 
                            onClick={() => handleDeleteDay(dayIndex)} 
                            className="p-2.5 bg-red-50/80 text-red-400 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 rounded-full transition-all flex items-center justify-center border border-red-100 hover:border-red-500" 
                            title="Delete Entire Day"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {day?.map && (
                        <div className="mb-12">
                          <div className="rounded-[28px] overflow-hidden shadow-md border-4 border-white bg-gray-50 relative group">
                            <iframe
                              src={day?.map}
                              width="100%"
                              height="350"
                              frameBorder="0"
                              allowFullScreen
                              className="w-full grayscale group-hover:grayscale-0 transition-all duration-700 opacity-90 group-hover:opacity-100"
                            ></iframe>
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[24px] pointer-events-none"></div>
                          </div>
                        </div>
                      )}

                      {Array.isArray(day?.activities) && (
                        <div className="relative z-10">
                          <h4 className="text-xl font-bold font-serif text-holiday-dark mb-8 flex items-center gap-3">
                            Activities
                            <span className="text-xs font-semibold text-holiday-dark/50 bg-gray-100/80 backdrop-blur-md px-3 py-1.5 rounded-full font-sans tracking-wide uppercase">Drag to reorder</span>
                          </h4>
                          
                          <Droppable droppableId={`day-${dayIndex}`} type="activity">
                            {(provided) => (
                              <div 
                                className="relative grid grid-cols-1 gap-6 font-sans min-h-[50px] pl-4 sm:pl-10 before:content-[''] before:absolute before:left-[15px] sm:before:left-[35px] before:top-6 before:bottom-6 before:w-0.5 before:bg-gradient-to-b before:from-holiday-teal/10 before:via-holiday-teal/30 before:to-holiday-teal/10"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {day?.activities.map((activity, idx) => {
                                  const gradientColors = [
                                    'from-pink-200 to-purple-400',
                                    'from-yellow-200 to-holiday-teal',
                                    'from-green-300 to-blue-400',
                                    'from-holiday-coral to-holiday-teal',
                                    'from-indigo-300 to-pink-300'
                                  ];
                                  const grad = gradientColors[(dayIndex + idx) % gradientColors.length];
                                  const hasImage = activity?.image_url && activity.image_url.startsWith('http');
                                  
                                  const placeName = activity?.place_name || "Activity";
                                  const details = activity?.place_details || "Get ready for a great experience at this location.";
                                  const rating = (activity?.rating && activity.rating !== "N/A" && activity.rating !== "null") ? activity.rating : "Unrated";
                                  let pricing = (activity?.ticket_pricing && activity.ticket_pricing !== "N/A" && activity.ticket_pricing !== "null") ? activity.ticket_pricing : "Included";
                                  if (pricing.toLowerCase() !== "included" && pricing.toLowerCase() !== "free") {
                                      pricing = convertPrice(pricing, currency, exchangeRates) || "Included";
                                      if (pricing === "$NaN") pricing = "Included";
                                  }
                                  const timeTravel = (activity?.time_travel && activity.time_travel !== "N/A" && activity.time_travel !== "null") ? activity.time_travel : "Flexible Time";

                                  return (
                                    <Draggable key={`act-${dayIndex}-${idx}`} draggableId={`act-${dayIndex}-${idx}`} index={idx}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className={`group bg-white rounded-3xl border border-gray-100 flex flex-col sm:flex-row gap-0 sm:gap-6 relative overflow-hidden ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-holiday-teal z-[60]' : 'shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1'} ${snapshot.isDragging ? '' : 'transition-all duration-300'}`}
                                        >
                                          {/* Enhanced Timeline Dot */}
                                          <div className="absolute -left-1.5 sm:-left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-tr from-holiday-teal to-blue-400 rounded-full shadow-[0_0_0_6px_white] z-10 hidden sm:block"></div>

                                          {/* Drag Handle */}
                                          <div 
                                            {...provided.dragHandleProps}
                                            className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center text-gray-300 hover:text-holiday-teal hover:bg-holiday-teal/10 transition-colors cursor-grab active:cursor-grabbing z-20"
                                          >
                                            <GripVertical className="w-5 h-5 ml-1 sm:ml-0" />
                                          </div>

                                          {/* Image Block */}
                                          <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 relative ml-8 sm:ml-6 mt-6 sm:mt-6 sm:mb-6 sm:mr-0 mr-6 rounded-2xl overflow-hidden shadow-inner border border-gray-100/50">
                                            {hasImage ? (
                                              <img src={activity.image_url} alt={placeName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                            ) : (
                                              <div className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center group-hover:scale-105 transition-transform duration-700 opacity-90`}>
                                                <span className="text-4xl filter drop-shadow-md opacity-80 mix-blend-overlay">✨</span>
                                              </div>
                                            )}
                                          </div>

                                          {/* Content Block */}
                                          <div className="p-6 sm:p-8 sm:pl-2 flex-grow flex flex-col justify-center ml-8 sm:ml-0 relative z-10">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                              <h5 className="text-2xl font-bold font-serif text-holiday-dark leading-tight">
                                                {placeName}
                                              </h5>
                                              {activity?.is_saved_note && (
                                                <span className="text-xs font-bold bg-gradient-to-r from-holiday-teal/20 to-holiday-teal/10 text-holiday-teal px-2.5 py-1 rounded-md border border-holiday-teal/20 shadow-sm flex items-center gap-1">
                                                  📌 Saved Note
                                                </span>
                                              )}
                                            </div>
                                            
                                            <p className="text-holiday-dark/65 text-sm sm:text-base mb-6 leading-relaxed max-w-2xl">{details}</p>
                                            
                                            <div className="flex flex-wrap items-center gap-3 mt-auto text-sm font-semibold text-holiday-dark/80">
                                              <span className="flex items-center gap-1.5 bg-yellow-50/80 backdrop-blur-sm text-yellow-700 px-3 py-1.5 rounded-xl border border-yellow-200/60 shadow-sm transition-transform hover:scale-105 cursor-default">
                                                ⭐ {rating}
                                              </span>
                                              <span className="flex items-center gap-1.5 bg-holiday-teal/10 backdrop-blur-sm text-holiday-teal px-3 py-1.5 rounded-xl border border-holiday-teal/20 shadow-sm transition-transform hover:scale-105 cursor-default">
                                                💳 {pricing}
                                              </span>
                                              <span className="flex items-center gap-1.5 bg-holiday-coral/10 backdrop-blur-sm text-holiday-coral px-3 py-1.5 rounded-xl border border-holiday-coral/20 shadow-sm transition-transform hover:scale-105 cursor-default">
                                                ⏱️ {timeTravel}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Hover Actions */}
                                          <div className="absolute right-4 top-4 sm:top-1/2 sm:-translate-y-1/2 flex sm:flex-col items-center justify-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 transform sm:translate-x-2 sm:group-hover:translate-x-0">
                                            <Link
                                              to={activity?.booking_url || `https://www.google.com/search?q=${encodeURIComponent(placeName + ' official website tickets booking')}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="p-3.5 bg-holiday-coral/90 backdrop-blur-md text-white shadow-lg shadow-holiday-coral/30 hover:bg-holiday-coral hover:scale-110 rounded-full transition-all flex items-center justify-center"
                                              title={activity?.booking_url ? "Book / Website" : "Search Booking"}
                                            >
                                              <ExternalLink className="w-5 h-5" />
                                            </Link>
                                            {activity?.geo_coordinates && (
                                              <Link
                                                to={`https://www.google.com/maps/search/?api=1&query=${activity.geo_coordinates.latitude},${activity.geo_coordinates.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3.5 bg-holiday-teal/90 backdrop-blur-md text-white shadow-lg shadow-holiday-teal/30 hover:bg-holiday-teal hover:scale-110 rounded-full transition-all flex items-center justify-center"
                                                title="View on Map"
                                              >
                                                <GrMapLocation className="text-xl" />
                                              </Link>
                                            )}
                                            <button onClick={() => handleDelete(dayIndex, idx)} className="p-3.5 bg-red-500/90 backdrop-blur-md text-white shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-110 rounded-full transition-all flex items-center justify-center" title="Delete Activity">
                                              <Trash2 className="w-5 h-5" />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })}
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

Itinerary.propTypes = {
  trip: PropTypes.shape({
    tripData: PropTypes.shape({
      itinerary: PropTypes.array,
    }),
  }),
  currency: PropTypes.string,
  exchangeRates: PropTypes.object,
};

export default Itinerary;
