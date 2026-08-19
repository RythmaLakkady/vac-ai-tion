import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash2, Edit2, ExternalLink, BookOpen, Map } from 'lucide-react';
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
      <h2 className="text-4xl font-bold font-serif text-ink mb-10 tracking-tight">
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
                      className={`bg-card/80 backdrop-blur-3xl p-6 sm:p-10 rounded-[40px] border border-border/50 relative overflow-hidden ${snapshot.isDragging ? 'shadow-[0_30px_60px_-15px_rgba(90,161,150,0.4)] border-amber z-50' : 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500'}`}
                    >
                      {/* Subtle background decoration */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-amber/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-10 relative z-10">
                        <div {...provided.dragHandleProps} className="text-gray-300 hover:text-amber cursor-grab active:cursor-grabbing p-2 -ml-4" title="Drag to reorder day">
                          <GripVertical className="w-7 h-7" />
                        </div>
                        <span className="bg-gradient-to-br from-coral to-pink-500 text-primary-foreground px-6 py-2 rounded-full font-bold shadow-[0_4px_14px_0_rgba(242,135,116,0.39)] text-lg font-sans whitespace-nowrap">
                          Day {dayIndex + 1}
                        </span> 
                        <h3 className="text-3xl font-bold font-serif text-ink ml-2">{day?.theme || "Exploration Day"}</h3>
                        <div className="flex flex-wrap items-center gap-3 md:ml-auto">
                          <span className="text-sm text-ink/80 font-semibold font-sans flex items-center gap-2 bg-amber/15 px-4 py-2.5 rounded-full backdrop-blur-sm border border-amber/20 shadow-sm">
                            🕒 {day?.best_time && day.best_time !== "N/A" ? day.best_time : "Anytime"}
                          </span>
                          <button 
                            onClick={() => handleDeleteDay(dayIndex)} 
                            className="p-2.5 bg-red-50/80 text-red-400 hover:bg-red-500 hover:text-primary-foreground hover:shadow-lg hover:shadow-red-500/30 rounded-full transition-all flex items-center justify-center border border-red-100 hover:border-red-500" 
                            title="Delete Entire Day"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {day?.daily_brief && (
                        <div className="mb-10 px-6 py-5 bg-card/60 rounded-3xl border border-border shadow-sm flex items-start gap-4">
                          <span className="text-3xl mt-1">🧭</span>
                          <div>
                            <h4 className="text-ink font-bold font-serif text-lg mb-1">Guide's Note</h4>
                            <p className="text-ink/70 font-sans text-sm leading-relaxed">{day.daily_brief}</p>
                          </div>
                        </div>
                      )}

                      {day?.map && (
                        <div className="mb-12">
                          <div className="rounded-[28px] overflow-hidden shadow-md border-4 border-border bg-gray-50 relative group">
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
                          <h4 className="text-xl font-bold font-serif text-ink mb-8 flex items-center gap-3">
                            Activities
                            <span className="text-xs font-semibold text-ink/50 bg-gray-100/80 backdrop-blur-md px-3 py-1.5 rounded-full font-sans tracking-wide uppercase">Drag to reorder</span>
                          </h4>
                          
                          <Droppable droppableId={`day-${dayIndex}`} type="activity">
                            {(provided) => (
                              <div 
                                className="relative grid grid-cols-1 gap-6 font-sans min-h-[50px] pl-4 sm:pl-10 before:content-[''] before:absolute before:left-[15px] sm:before:left-[35px] before:top-6 before:bottom-6 before:w-0.5 before:bg-gradient-to-b before:from-amber/10 before:via-amber/30 before:to-amber/10"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {day?.activities.map((activity, idx) => {
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
                                          className={`group bg-card rounded-3xl border border-gray-100 flex flex-col sm:flex-row gap-0 sm:gap-6 relative overflow-hidden ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-amber z-[60]' : 'shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1'} ${snapshot.isDragging ? '' : 'transition-all duration-300'}`}
                                        >
                                          {/* Enhanced Timeline Dot */}
                                          <div className="absolute -left-1.5 sm:-left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-tr from-amber to-blue-400 rounded-full shadow-[0_0_0_6px_white] z-10 hidden sm:block"></div>

                                          {/* Drag Handle */}
                                          <div 
                                            {...provided.dragHandleProps}
                                            className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center text-gray-300 hover:text-amber hover:bg-amber/10 transition-colors cursor-grab active:cursor-grabbing z-20"
                                          >
                                            <GripVertical className="w-5 h-5 ml-1 sm:ml-0" />
                                          </div>

                                          {/* Content Block */}
                                          <div className="p-6 sm:p-8 flex-grow flex flex-col justify-center ml-8 sm:ml-0 relative z-10 w-full pr-16">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                              <h5 className="text-2xl font-bold font-serif text-ink leading-tight">
                                                {placeName}
                                              </h5>
                                              {activity?.customization_banner && (
                                                <span className="text-xs font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-md border border-green-200 shadow-sm flex items-center gap-1">
                                                  ✨ {activity.customization_banner}
                                                </span>
                                              )}
                                              {activity?.is_saved_note && (
                                                <span className="text-xs font-bold bg-amber/10 text-amber px-2.5 py-1 rounded-md border border-amber/20 shadow-sm flex items-center gap-1">
                                                  📌 Saved Note
                                                </span>
                                              )}
                                              {activity?.is_hidden_gem && (
                                                <span className="text-xs font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md border border-purple-200 shadow-sm flex items-center gap-1">
                                                  💎 Hidden Gem
                                                </span>
                                              )}
                                            </div>
                                            
                                            <p className="text-ink/80 font-medium text-sm sm:text-base mb-1 leading-relaxed max-w-3xl">{details}</p>
                                            {activity?.importance && (
                                              <p className="text-ink/60 text-sm mb-6 leading-relaxed max-w-3xl border-l-2 border-amber/30 pl-3 italic">
                                                {activity.importance}
                                              </p>
                                            )}
                                            {!activity?.importance && <div className="mb-6"></div>}
                                            
                                            <div className="flex flex-wrap items-center gap-3 mt-auto text-sm font-semibold text-ink/80">
                                              <span className="flex items-center gap-1.5 bg-yellow-50/80 backdrop-blur-sm text-yellow-700 px-3 py-1.5 rounded-xl border border-yellow-200/60 shadow-sm transition-transform hover:scale-105 cursor-default">
                                                ⭐ {rating}
                                              </span>
                                              <span className="flex items-center gap-1.5 bg-amber/10 backdrop-blur-sm text-amber px-3 py-1.5 rounded-xl border border-amber/20 shadow-sm transition-transform hover:scale-105 cursor-default">
                                                💳 {pricing}
                                              </span>
                                              <span className="flex items-center gap-1.5 bg-orange-50 backdrop-blur-sm text-orange-600 px-3 py-1.5 rounded-xl border border-orange-200/60 shadow-sm transition-transform hover:scale-105 cursor-default">
                                                ⏱️ {timeTravel}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Hover Actions */}
                                          <div className="absolute right-4 top-4 sm:top-1/2 sm:-translate-y-1/2 flex sm:flex-col items-center justify-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 transform sm:translate-x-2 sm:group-hover:translate-x-0 z-20">
                                            {activity?.read_more_url && (
                                              <Link
                                                to={activity.read_more_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-11 h-11 shrink-0 bg-blue-500/90 backdrop-blur-md text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:scale-110 rounded-full transition-all flex items-center justify-center"
                                                title="Read More (Wikipedia / Info)"
                                              >
                                                <BookOpen className="w-5 h-5" />
                                              </Link>
                                            )}
                                            <Link
                                              to={activity?.booking_url || `https://www.google.com/search?q=${encodeURIComponent(placeName + ' official website tickets booking')}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="w-11 h-11 shrink-0 bg-orange-500/90 backdrop-blur-md text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:scale-110 rounded-full transition-all flex items-center justify-center"
                                              title={activity?.booking_url ? "Book / Website" : "Search Booking"}
                                            >
                                              <ExternalLink className="w-5 h-5" />
                                            </Link>
                                            {activity?.geo_coordinates && (
                                              <Link
                                                to={`https://www.google.com/maps/search/?api=1&query=${activity.geo_coordinates.latitude},${activity.geo_coordinates.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-11 h-11 shrink-0 bg-emerald-500/90 backdrop-blur-md text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:scale-110 rounded-full transition-all flex items-center justify-center"
                                                title="View on Map"
                                              >
                                                <Map className="w-5 h-5" />
                                              </Link>
                                            )}
                                            <button onClick={() => handleDelete(dayIndex, idx)} className="w-11 h-11 shrink-0 bg-red-500/90 backdrop-blur-md text-white shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-110 rounded-full transition-all flex items-center justify-center" title="Delete Activity">
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
