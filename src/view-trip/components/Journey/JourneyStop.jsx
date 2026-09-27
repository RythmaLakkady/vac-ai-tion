import React, { useState } from 'react';
import { Wallet, MoreVertical, MapPin, Edit2, Replace, Trash2, GripVertical } from 'lucide-react';
import { analytics } from '@/service/analyticsService';
import { Draggable } from '@hello-pangea/dnd';

export default function JourneyStop({ activity, dayIndex, activityIndex, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit state
  const [editName, setEditName] = useState(activity?.place_name || "");
  const [editTime, setEditTime] = useState(activity?.time_travel || "");

  // Destructure with fallbacks
  const placeName = activity?.place_name || "Unknown Stop";
  const category = activity?.category || "Activity";
  const time = activity?.time_travel || "";
  const cost = activity?.ticket_pricing && activity.ticket_pricing !== "N/A" ? activity.ticket_pricing : null;
  const why = activity?.importance || null;

  // Determine if it's a primary stop based on heuristics
  const isPrimary = why || category.toLowerCase().includes("museum") || category.toLowerCase().includes("attraction");

  const toggleExpand = () => {
    if (isEditing) return; // Don't toggle when editing
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (newExpanded) {
      analytics.trackEvent('stop_opened', { placeName, category, dayIndex });
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    onEdit?.({ place_name: editName, time_travel: editTime });
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={`day-${dayIndex}-stop-${activityIndex}`} index={activityIndex}>
      {(provided, snapshot) => (
        <div 
          className={`relative flex items-start gap-4 sm:gap-6 group outline-none ${snapshot.isDragging ? 'opacity-80' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          {/* Node / Marker */}
          <div className="flex flex-col items-center mt-6">
            <div className={`w-4 h-4 rounded-full shadow-sm z-10 ${isPrimary ? 'bg-amber ring-4 ring-amber/20' : 'bg-ink/40'}`} />
          </div>

          {/* Stop Card */}
          <div className="flex-1 pb-1 w-full flex items-stretch">
            
            {/* Drag Handle */}
            <div 
              className="flex items-center justify-center px-1 text-border hover:text-ink/40 cursor-grab active:cursor-grabbing transition-colors"
              {...provided.dragHandleProps}
              aria-label="Drag to reorder"
            >
              <GripVertical className="w-5 h-5" />
            </div>

            <div 
              onClick={toggleExpand}
              className={`flex-1 bg-card hover:bg-gray-50/80 border ${snapshot.isDragging ? 'border-amber shadow-lg scale-[1.01]' : 'border-border shadow-sm'} rounded-3xl p-5 sm:p-6 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber outline-none`}
              role="button"
              tabIndex={0}
              aria-expanded={expanded}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-widest text-ink/50">{category}</span>
                    {!isEditing ? (
                      time && <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md whitespace-nowrap">{time}</span>
                    ) : (
                      <input 
                        type="text" 
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-semibold bg-white border border-border px-2 py-0.5 rounded-md outline-none focus:border-amber"
                        placeholder="Time"
                      />
                    )}
                  </div>
                  
                  {!isEditing ? (
                    <h4 className="text-xl font-bold font-serif text-ink">{placeName}</h4>
                  ) : (
                    <input 
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xl font-bold font-serif text-ink bg-white border border-border px-2 py-1 rounded-lg w-full mt-1 outline-none focus:border-amber"
                    />
                  )}
                </div>
                
                {!isEditing && (
                  <button 
                    className="text-gray-400 hover:text-ink opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 -mr-2"
                    aria-label="Actions"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                )}
                {isEditing && (
                  <button 
                    onClick={handleSave}
                    className="bg-amber/10 text-amber hover:bg-amber hover:text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Save
                  </button>
                )}
              </div>

              {expanded && (
                <div className="mt-5 pt-5 border-t border-border/50 text-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {why && (
                    <div className="flex items-start gap-3 text-ink/80 bg-amber/5 p-4 rounded-2xl border border-amber/10">
                      <span className="font-serif italic font-medium leading-relaxed">"{why}"</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-ink/60 font-medium">
                    {cost && (
                      <div className="flex items-center gap-1.5">
                        <Wallet className="w-4 h-4" /> {cost}
                      </div>
                    )}
                    {activity?.place_details && (
                      <p className="w-full text-ink/70 leading-relaxed mt-1 text-base">{activity.place_details}</p>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-border/30">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-ink/60 hover:text-ink transition-colors font-medium text-xs">
                      <MapPin className="w-3.5 h-3.5" /> Map
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-ink/60 hover:text-ink transition-colors font-medium text-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-amber/10 text-amber hover:text-amber transition-colors font-medium text-xs">
                      <Replace className="w-3.5 h-3.5" /> Alternatives
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 text-ink/60 hover:text-red-500 transition-colors font-medium text-xs ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
