import React, { useState } from 'react';
import { Wallet, MoreVertical, MapPin, Edit2, Replace, Trash2, GripVertical, Compass, CheckCircle2, X, Clock, Navigation } from 'lucide-react';
import { analytics } from '@/service/analyticsService';
import { Draggable } from '@hello-pangea/dnd';
import { journeyIntelligence } from '@/service/journeyIntelligence';
import { priceService } from '@/service/priceService';
import { auth } from '@/firebase';

export default function JourneyStop({ 
  trip, activity, dayIndex, activityIndex, id, isSelected, 
  onDelete, onEdit, onInsert, onReplace, onSelect, onExploreArea,
  previousActivity, nextActivity 
}) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Nearby / Alternatives / Compare Prices state
  const [activeTab, setActiveTab] = useState(null); // 'nearby' | 'alternatives' | 'compare_prices' | null
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [searchCategory, setSearchCategory] = useState("Cafés");
  
  // Replacement specific state
  const [compareStop, setCompareStop] = useState(null);
  const [insertPreviewStop, setInsertPreviewStop] = useState(null);

  // Edit state
  const [editName, setEditName] = useState(activity?.place_name || "");
  const [editTime, setEditTime] = useState(activity?.time_travel || "");

  // Fallbacks
  const placeName = activity?.place_name || "Unknown Stop";
  const category = activity?.category || "Activity";
  const time = activity?.time_travel || "";
  
  // Cost Model & Price Provenance preparation
  const getCostDetails = (act) => {
    if (!act?.ticket_pricing || act.ticket_pricing === "N/A" || act.ticket_pricing.toLowerCase() === "unknown") {
      return { amount: null, state: 'unknown', display: 'Cost unknown', provenance: 'unknown' };
    }
    if (act.ticket_pricing.toLowerCase() === "free") {
      return { amount: 0, state: 'known', display: 'Free', provenance: 'actual provider price' };
    }
    // If it has costState from LLM alternative
    if (act.costState === 'estimated') {
      return { amount: act.ticket_pricing, state: 'estimated', display: act.ticket_pricing, provenance: 'estimated price' };
    }
    // Legacy generic string parsing
    return { amount: act.ticket_pricing, state: 'estimated', display: act.ticket_pricing, provenance: 'reference estimate' };
  };

  const costDetails = getCostDetails(activity);
  const cost = costDetails.amount !== null ? costDetails.display : null;
  const why = activity?.importance || null;
  const lat = activity?.geo_coordinates?.lat || activity?.geo_coordinates?.latitude;
  const lng = activity?.geo_coordinates?.lng || activity?.geo_coordinates?.longitude;

  const isPrimary = why || category.toLowerCase().includes("museum") || category.toLowerCase().includes("attraction");

  const toggleExpand = () => {
    if (isEditing) return;
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (!newExpanded) {
       setActiveTab(null);
       setCompareStop(null);
       setInsertPreviewStop(null);
    }
    if (newExpanded) {
      analytics.trackEvent('stop_opened', { placeName, category, dayIndex });
    }
  };

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    onEdit?.({ place_name: editName, time_travel: editTime });
    setIsEditing(false);
  };
  
  const exploreNearby = async (e, cat = searchCategory) => {
    if (e) e.stopPropagation();
    setActiveTab('nearby');
    setSearchCategory(cat);
    setLoading(true);
    setError(null);
    analytics.trackEvent('nearby_places_opened', { placeName, searchCategory: cat });
    
    try {
      const places = await journeyIntelligence.getNearbyPlaces(lat, lng, cat);
      if (places.length === 0) {
        setError("Nothing useful found nearby.");
      } else {
        setResults(places);
      }
    } catch (err) {
      setError(err.message || "Nearby places are temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const exploreAlternatives = async (e, reason = "better") => {
    if (e) e.stopPropagation();
    setActiveTab('alternatives');
    setLoading(true);
    setError(null);
    analytics.trackEvent('journey_alternative_opened', { placeName, reason });
    
    try {
       const places = await journeyIntelligence.getAlternatives({
         currentStop: activity,
         location: placeName,
         reason: reason,
         previousStop: previousActivity,
         nextStop: nextActivity,
         budget: trip?.tripData?.budget,
         preferences: trip?.tripData?.traveler
       });
       if (places.length === 0) {
         setError("No suitable alternatives found.");
       } else {
         setResults(places);
       }
    } catch (err) {
       setError(err.message || "Alternatives are temporarily unavailable.");
    } finally {
       setLoading(false);
    }
  };
  const comparePrices = async (e) => {
    if (e) e.stopPropagation();
    setActiveTab('compare_prices');
    setLoading(true);
    setError(null);
    analytics.trackEvent('price_comparison_opened', { placeName, category });
    
    try {
       const data = await priceService.comparePrices({
         destination: placeName,
         dates: { 
            start: trip?.tripData?.startDate || new Date().toISOString(), 
            end: trip?.tripData?.endDate || new Date().toISOString() 
         },
         preferences: {
            userId: auth?.currentUser?.uid || 'anon',
            budget: trip?.tripData?.budget || 'Affordable Comfort'
         }
       });
       
       let relevantResults = data.results || [];
       if (category.toLowerCase().includes('hotel') || category.toLowerCase().includes('accommodation')) {
          relevantResults = relevantResults.filter(r => r.type === 'Hotel');
       } else if (category.toLowerCase().includes('flight') || category.toLowerCase().includes('transport') || category.toLowerCase().includes('flight')) {
          relevantResults = relevantResults.filter(r => r.type === 'Flight');
       } else {
          relevantResults = relevantResults.filter(r => r.type === 'Ticket' || r.type === 'Activity');
       }

       if (relevantResults.length === 0) {
         setError("No comparable options found.");
       } else {
         setResults(relevantResults);
       }
    } catch (err) {
       setError("Live pricing unavailable. Showing available estimates.");
    } finally {
       setLoading(false);
    }
  };



  
  const handleCompare = (e, res) => {
    e.stopPropagation();
    analytics.trackEvent('journey_alternative_compared', { placeName: res.place_name });
    setCompareStop(res);
  };

  const handleConfirmReplace = (e) => {
    e.stopPropagation();
    if (!compareStop) return;
    analytics.trackEvent('journey_alternative_selected', { old: placeName, new: compareStop.place_name });
    onReplace?.(compareStop);
    setCompareStop(null);
    setActiveTab(null);
  };

  return (
    <Draggable draggableId={`day-${dayIndex}-stop-${activityIndex}`} index={activityIndex}>
      {(provided, snapshot) => (
        <div 
          id={id}
          className={`relative flex items-start gap-4 sm:gap-6 group outline-none ${snapshot.isDragging ? 'opacity-80 z-50' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          {/* Node / Marker */}
          <div className="flex flex-col items-center mt-6 shrink-0">
            <div className={`w-4 h-4 rounded-full shadow-sm z-10 transition-colors ${isSelected ? 'bg-amber ring-4 ring-amber/40 scale-125' : isPrimary ? 'bg-amber ring-4 ring-amber/20' : 'bg-ink/40'}`} />
          </div>

          {/* Stop Card */}
          <div className="flex-1 pb-1 w-full min-w-0 flex items-stretch">
            
            {/* Drag Handle */}
            <div 
              className="flex items-center justify-center px-1 text-border hover:text-ink/40 cursor-grab active:cursor-grabbing transition-colors shrink-0"
              {...provided.dragHandleProps}
            >
              <GripVertical className="w-5 h-5" />
            </div>

            <div 
              onClick={(e) => {
                onSelect?.();
                toggleExpand();
              }}
              className={`flex-1 bg-card hover:bg-gray-50/80 border ${isSelected ? 'border-amber shadow-md' : snapshot.isDragging ? 'border-amber shadow-lg scale-[1.01]' : 'border-border shadow-sm'} rounded-3xl p-5 sm:p-6 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber outline-none overflow-hidden`}
              role="button"
              tabIndex={0}
              aria-expanded={expanded}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-widest text-ink/50 truncate max-w-[120px]">{category}</span>
                    {!isEditing ? (
                      time && <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md whitespace-nowrap">{time}</span>
                    ) : (
                      <input 
                        type="text" 
                        value={editTime}
                        onChange={(e) => setEditTime(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-semibold bg-white border border-border px-2 py-0.5 rounded-md outline-none focus:border-amber w-24"
                        placeholder="Time"
                      />
                    )}
                  </div>
                  
                  {!isEditing ? (
                    <h4 className="text-xl font-bold font-serif text-ink truncate whitespace-normal break-words">{placeName}</h4>
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
                
                {!isEditing && !expanded && (
                  <button 
                    className="text-gray-400 hover:text-ink opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 -mr-2 shrink-0"
                    aria-label="Actions"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                )}
                {isEditing && (
                  <button 
                    onClick={handleSaveEdit}
                    className="bg-amber/10 text-amber hover:bg-amber hover:text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors shrink-0"
                  >
                    Save
                  </button>
                )}
              </div>

              {expanded && (
                <div className="mt-5 pt-5 border-t border-border/50 text-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                  
                  {/* Default Content view (when no tab is active) */}
                  {!activeTab && (
                    <>
                      {why && (
                        <div className="flex items-start gap-3 text-ink/80 bg-amber/5 p-4 rounded-2xl border border-amber/10">
                          <span className="font-serif italic font-medium leading-relaxed">"{why}"</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-ink/60 font-medium">
                        {cost && (
                          <div className="flex items-center gap-1.5" title={`Source: ${costDetails.provenance}`}>
                            <Wallet className="w-4 h-4" /> 
                            <span>{cost}</span>
                            {costDetails.state === 'estimated' && <span className="text-[10px] uppercase text-ink/40 ml-1 bg-gray-100 px-1.5 rounded">Est</span>}
                          </div>
                        )}
                        {activity?.place_details && (
                          <p className="w-full text-ink/70 leading-relaxed mt-1 text-base">{activity.place_details}</p>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-border/30">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onExploreArea?.(); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium text-xs"
                        >
                          <MapPin className="w-3.5 h-3.5" /> Explore {activity?.location || 'Area'}
                        </button>
                        <button 
                          onClick={(e) => exploreNearby(e, 'Cafés')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber/10 text-amber hover:bg-amber hover:text-white transition-colors font-medium text-xs"
                        >
                          <Compass className="w-3.5 h-3.5" /> Explore nearby
                        </button>
                        <button 
                          onClick={(e) => exploreAlternatives(e, 'closer')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-ink/60 hover:text-ink transition-colors font-medium text-xs"
                        >
                          <Replace className="w-3.5 h-3.5" /> Replace
                        </button>
                        <button 
                          onClick={(e) => comparePrices(e)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium text-xs"
                        >
                          <Wallet className="w-3.5 h-3.5" /> Compare prices
                        </button>
                        <button 
                          onClick={(e) => { setIsEditing(true); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 text-ink/60 hover:text-ink transition-colors font-medium text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button 
                          onClick={(e) => { onDelete?.(); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 text-ink/60 hover:text-red-500 transition-colors font-medium text-xs ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}

                  {/* EXPLORE NEARBY VIEW */}
                  {activeTab === 'nearby' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-bold text-ink">{insertPreviewStop ? 'Preview Insertion' : 'Explore Nearby'}</h5>
                        <button onClick={() => { setActiveTab(null); setInsertPreviewStop(null); }} className="text-gray-400 hover:text-ink p-1"><X className="w-4 h-4" /></button>
                      </div>
                      
                      {!insertPreviewStop ? (
                        <>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
                            {['Cafés', 'Food', 'Parks', 'Attractions'].map(cat => (
                              <button 
                                key={cat}
                                onClick={(e) => exploreNearby(e, cat)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${searchCategory === cat ? 'bg-ink text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>

                          {loading ? (
                            <div className="py-8 text-center text-gray-400 animate-pulse text-sm">Searching trusted sources...</div>
                          ) : error ? (
                            <div className="py-8 text-center text-red-400 text-sm">{error}</div>
                          ) : (
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                              {results.map((res, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-amber bg-white transition-all">
                                  <div>
                                    <h6 className="font-bold text-ink text-sm">{res.place_name}</h6>
                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Navigation className="w-3 h-3"/> {res.distance}</p>
                                  </div>
                                  <button 
                                    onClick={(e) => handleSelectNearby(e, res)}
                                    className="px-3 py-1.5 text-xs font-bold text-amber bg-amber/10 rounded-lg hover:bg-amber hover:text-white transition-colors whitespace-nowrap"
                                  >
                                    Add to journey
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="animate-in fade-in zoom-in-95 duration-200">
                          <p className="text-sm text-gray-600 mb-4 text-center">Add <strong>{insertPreviewStop.place_name}</strong> to your journey?</p>
                          <div className="flex flex-col gap-2 mb-6 max-w-sm mx-auto items-center">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest text-center">Between:</span>
                            <div className="bg-gray-50 border border-border rounded-lg p-3 w-full text-center">
                              <span className="font-semibold text-sm">{placeName}</span>
                            </div>
                            <div className="text-gray-300">↓</div>
                            <div className="bg-gray-50 border border-border rounded-lg p-3 w-full text-center">
                              <span className="font-semibold text-sm">{nextActivity?.place_name || 'End of Day'}</span>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 mb-6 text-center">
                            <strong>Impact:</strong> Adding this stop {insertPreviewStop.time_travel ? `is estimated to take ${insertPreviewStop.time_travel}` : 'has unknown timing impact'}. Your next activity remains compatible.
                          </div>

                          <div className="flex items-center gap-3">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setInsertPreviewStop(null); }}
                              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={handleConfirmInsert}
                              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-ink hover:bg-ink/90 transition-colors"
                            >
                              Add here
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ALTERNATIVES VIEW */}
                  {activeTab === 'alternatives' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-bold text-ink">Replace {placeName}</h5>
                        <button onClick={() => { setActiveTab(null); setCompareStop(null); }} className="text-gray-400 hover:text-ink p-1"><X className="w-4 h-4" /></button>
                      </div>

                      {!compareStop ? (
                        <>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {['closer', 'cheaper', 'more relaxing', 'more popular'].map(reason => (
                              <button 
                                key={reason}
                                onClick={(e) => exploreAlternatives(e, reason)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${loading ? 'opacity-50' : ''}`}
                              >
                                {reason === 'closer' ? '📍 Closer' : reason === 'cheaper' ? '💰 Cheaper' : reason === 'more relaxing' ? '🌿 More relaxing' : '⭐ More popular'}
                              </button>
                            ))}
                          </div>

                          {loading ? (
                            <div className="py-8 text-center text-gray-400 animate-pulse text-sm">Finding context-aware alternatives...</div>
                          ) : error ? (
                            <div className="py-8 text-center text-red-400 text-sm">{error}</div>
                          ) : (
                            <div className="space-y-3">
                              {results.map((res, i) => (
                                <div key={i} className="p-4 rounded-xl border border-border/60 hover:border-amber bg-white transition-all">
                                  <div className="flex items-start justify-between gap-4 mb-2">
                                    <h6 className="font-bold text-ink text-base">{res.place_name}</h6>
                                    <button 
                                      onClick={(e) => handleCompare(e, res)}
                                      className="px-3 py-1.5 text-xs font-bold text-amber bg-amber/10 rounded-lg hover:bg-amber hover:text-white transition-colors"
                                    >
                                      Compare
                                    </button>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{res.place_details}</p>
                                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {res.time_travel}</span>
                                    {res.ticket_pricing !== 'unknown' && <span className="flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> {res.ticket_pricing}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        /* COMPARE VIEW */
                        <div className="animate-in fade-in zoom-in-95 duration-200">
                          <div className="grid grid-cols-2 gap-4 mb-6 relative">
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-100 rounded-full p-2 z-10 font-bold text-xs text-gray-500 border border-white">VS</div>
                            
                            {/* Current */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-border/50 opacity-70">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Current</span>
                              <h6 className="font-bold text-ink text-sm mb-2 truncate">{placeName}</h6>
                              <div className="space-y-1.5 text-xs text-gray-500">
                                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {time || 'Unknown time'}</div>
                                <div className="flex items-center gap-1.5" title={`Source: ${costDetails.provenance}`}>
                                  <Wallet className="w-3.5 h-3.5"/> 
                                  <span>{cost || 'Unknown cost'}</span>
                                  {costDetails.state === 'estimated' && <span className="text-[9px] uppercase text-gray-400 ml-1">Est</span>}
                                </div>
                              </div>
                            </div>
                            
                            {/* Alternative */}
                            <div className="bg-amber/5 p-4 rounded-xl border border-amber/20">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-amber mb-1 block">Alternative</span>
                              <h6 className="font-bold text-ink text-sm mb-2 truncate">{compareStop.place_name}</h6>
                              <div className="space-y-1.5 text-xs text-ink/70">
                                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {compareStop.time_travel}</div>
                                <div className="flex items-center gap-1.5" title={`Source: ${compareStop.costState || 'estimated'}`}>
                                  <Wallet className="w-3.5 h-3.5"/> 
                                  <span>{compareStop.ticket_pricing !== 'unknown' ? compareStop.ticket_pricing : 'Cost unknown'}</span>
                                  {compareStop.costState === 'estimated' && <span className="text-[9px] uppercase text-amber/60 ml-1">Est</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 mb-6">
                            <strong>Impact:</strong> Replacing this stop {compareStop.time_travel ? `is estimated to take ${compareStop.time_travel}` : 'has unknown timing impact'}.
                          </div>

                          <div className="flex items-center gap-3">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setCompareStop(null); }}
                              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              Keep Current
                            </button>
                            <button 
                              onClick={handleConfirmReplace}
                              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-ink hover:bg-ink/90 transition-colors"
                            >
                              Replace Stop
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* COMPARE PRICES VIEW */}
                  {activeTab === 'compare_prices' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-bold text-ink flex items-center gap-2"><Wallet className="w-4 h-4 text-green-600"/> Compare Options for {placeName}</h5>
                        <button onClick={() => { setActiveTab(null); setCompareStop(null); }} className="text-gray-400 hover:text-ink p-1"><X className="w-4 h-4" /></button>
                      </div>

                      {!compareStop ? (
                        <>
                          {loading ? (
                            <div className="py-8 text-center text-gray-400 animate-pulse text-sm">Searching live providers...</div>
                          ) : error ? (
                            <div className="py-8 text-center text-red-400 text-sm">{error}</div>
                          ) : (
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                              <div className="p-3 bg-gray-50 rounded-xl mb-4 text-xs text-gray-600 flex items-center justify-between border border-border">
                                <div>
                                  <span className="font-bold block uppercase tracking-widest text-[10px] text-gray-400">Current Cost</span>
                                  <span className="font-semibold text-ink text-sm">{cost || 'Unknown'}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold block uppercase tracking-widest text-[10px] text-gray-400">Source</span>
                                  <span className="capitalize">{costDetails.provenance}</span>
                                </div>
                              </div>
                              {results.map((res, i) => {
                                // calculate diff visually if possible
                                let diffLabel = null;
                                let currentPriceNum = parseFloat((cost || '').replace(/[^0-9.]/g, ''));
                                let newPriceNum = parseFloat(String(res.price).replace(/[^0-9.]/g, ''));
                                
                                if (!isNaN(currentPriceNum) && !isNaN(newPriceNum) && currentPriceNum > 0) {
                                  let diff = currentPriceNum - newPriceNum;
                                  if (diff > 0) {
                                    diffLabel = <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-[10px] font-bold">Save ${diff}</span>;
                                  } else if (diff < 0) {
                                    diffLabel = <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded text-[10px] font-bold">+${Math.abs(diff)}</span>;
                                  } else {
                                    diffLabel = <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold">Same price</span>;
                                  }
                                }

                                return (
                                  <div key={i} className="p-3 rounded-xl border border-border/60 hover:border-amber bg-white transition-all flex items-center justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                      <h6 className="font-bold text-ink text-sm truncate">{res.vendor}</h6>
                                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                        <span className="font-bold text-amber">${res.price}</span>
                                        <span>⭐ {res.rating}</span>
                                        {diffLabel}
                                      </div>
                                    </div>
                                    <button 
                                      onClick={(e) => {
                                        analytics.trackEvent('price_option_selected', { vendor: res.vendor, price: res.price });
                                        handleCompare(e, {
                                          ...activity,
                                          place_name: `${activity.place_name} (${res.vendor})`,
                                          ticket_pricing: `$${res.price}`,
                                          costState: 'known',
                                          place_details: `Selected via ${res.vendor}. Refundable: ${res.refundable}. Score: ${res.score}. CO2: ${res.co2Kg}kg`
                                        });
                                      }}
                                      className="px-3 py-1.5 text-xs font-bold text-amber bg-amber/10 rounded-lg hover:bg-amber hover:text-white transition-colors"
                                    >
                                      Select
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        /* COMPARE VIEW (REUSED) */
                        <div className="animate-in fade-in zoom-in-95 duration-200">
                          <div className="grid grid-cols-2 gap-4 mb-6 relative">
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-100 rounded-full p-2 z-10 font-bold text-xs text-gray-500 border border-white">VS</div>
                            
                            <div className="bg-gray-50 p-4 rounded-xl border border-border/50 opacity-70">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 block">Current</span>
                              <h6 className="font-bold text-ink text-sm mb-2 truncate">{placeName}</h6>
                              <div className="space-y-1.5 text-xs text-gray-500">
                                <div className="flex items-center gap-1.5" title={`Source: ${costDetails.provenance}`}>
                                  <Wallet className="w-3.5 h-3.5"/> 
                                  <span>{cost || 'Unknown cost'}</span>
                                  <span className="text-[9px] uppercase text-gray-400 ml-1">({costDetails.state})</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-green-50/50 p-4 rounded-xl border border-green-200">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-1 block">Selected Option</span>
                              <h6 className="font-bold text-ink text-sm mb-2 truncate">{compareStop.place_name}</h6>
                              <div className="space-y-1.5 text-xs text-ink/70">
                                <div className="flex items-center gap-1.5" title="Source: actual provider price">
                                  <Wallet className="w-3.5 h-3.5 text-green-700"/> 
                                  <span className="font-bold text-green-800">{compareStop.ticket_pricing !== 'unknown' ? compareStop.ticket_pricing : 'Cost unknown'}</span>
                                  <span className="text-[9px] uppercase text-green-600 ml-1">(known)</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-4">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setCompareStop(null); }}
                              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              Go Back
                            </button>
                            <button 
                              onClick={handleConfirmReplace}
                              className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-ink hover:bg-ink/90 transition-colors"
                            >
                              Confirm Change
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
