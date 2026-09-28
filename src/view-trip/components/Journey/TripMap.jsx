import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Helper component to center map on bounds or selected stop
function MapBoundsUpdater({ stops, selectedStopId }) {
  const map = useMap();
  
  useEffect(() => {
    if (!stops || stops.length === 0) return;
    
    // If a stop is selected, fly to it
    if (selectedStopId) {
      const selectedStop = stops.find(s => s.id === selectedStopId);
      if (selectedStop && selectedStop.lat && selectedStop.lng) {
        map.flyTo([selectedStop.lat, selectedStop.lng], 15, { duration: 0.8 });
        return;
      }
    }
    
    // Otherwise fit all valid stops
    const validStops = stops.filter(s => s.lat && s.lng);
    if (validStops.length > 0) {
      const bounds = L.latLngBounds(validStops.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, duration: 0.8 });
    }
  }, [stops, selectedStopId, map]);
  
  return null;
}

const createStopIcon = (number, isSelected) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      background-color: ${isSelected ? '#F59E0B' : 'white'};
      color: ${isSelected ? 'white' : '#1E1B4B'};
      border: 2px solid #F59E0B;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: all 0.2s;
      transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
      z-index: ${isSelected ? 1000 : 1};
    ">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export default function TripMap({ itinerary, selectedStopId, onStopSelected, selectedDayIndex }) {
  // Extract all valid stops with coordinates
  const stops = useMemo(() => {
    const allStops = [];
    itinerary?.forEach((day, dIdx) => {
      day.activities?.forEach((act, aIdx) => {
        const id = `day-${dIdx}-stop-${aIdx}`;
        // Support both lat/lng and latitude/longitude just in case
        const lat = act.geo_coordinates?.lat || act.geo_coordinates?.latitude;
        const lng = act.geo_coordinates?.lng || act.geo_coordinates?.longitude;
        
        if (lat && lng) {
          allStops.push({
            id,
            dayIndex: dIdx,
            activityIndex: aIdx,
            name: act.place_name,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            number: aIdx + 1,
            isFaded: selectedDayIndex !== null && selectedDayIndex !== undefined && selectedDayIndex !== dIdx
          });
        }
      });
    });
    return allStops;
  }, [itinerary, selectedDayIndex]);

  if (!stops || stops.length === 0) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50 border border-border rounded-3xl">
        <div className="text-center">
          <p className="text-gray-500 font-medium mb-1">Map unavailable</p>
          <p className="text-sm text-gray-400">No trustworthy location data found for this itinerary.</p>
        </div>
      </div>
    );
  }

  // Group by day for Polylines
  const polylines = useMemo(() => {
    const lines = [];
    itinerary?.forEach((day, dIdx) => {
      const dayStops = stops.filter(s => s.dayIndex === dIdx);
      if (dayStops.length > 1) {
        lines.push({
          dayIndex: dIdx,
          positions: dayStops.map(s => [s.lat, s.lng]),
          isFaded: selectedDayIndex !== null && selectedDayIndex !== undefined && selectedDayIndex !== dIdx
        });
      }
    });
    return lines;
  }, [stops, itinerary, selectedDayIndex]);

  const defaultCenter = [stops[0].lat, stops[0].lng];

  return (
    <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden shadow-sm border border-border relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }} 
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {polylines.map((line, idx) => (
          <Polyline 
            key={`line-${idx}`} 
            positions={line.positions} 
            color={line.isFaded ? "#cbd5e1" : "#F59E0B"} 
            weight={3}
            dashArray="5, 10"
            opacity={line.isFaded ? 0.5 : 0.8}
          />
        ))}

        {stops.map((stop) => {
          const isSelected = selectedStopId === stop.id;
          return (
            <Marker 
              key={stop.id}
              position={[stop.lat, stop.lng]}
              icon={createStopIcon(stop.number, isSelected)}
              eventHandlers={{
                click: () => onStopSelected?.(stop.id, stop.dayIndex)
              }}
              opacity={stop.isFaded ? 0.6 : 1}
            >
              <Popup className="rounded-xl">
                <div className="font-sans">
                  <h4 className="font-bold text-ink mb-1">{stop.name}</h4>
                  <p className="text-xs text-gray-500 mb-0">Day {stop.dayIndex + 1}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        <MapBoundsUpdater stops={stops} selectedStopId={selectedStopId} />
      </MapContainer>
    </div>
  );
}
