'use client';

import { useState, useMemo } from 'react';
import Map, { Marker, ViewStateChangeEvent } from 'react-map-gl';
import { useSimulationStore } from '@/lib/store';
import 'mapbox-gl/dist/mapbox-gl.css';

/**
 * MapViewport - Real-world Highway Visualization
 * Renders NH-44 near Delhi with interactive pole markers
 */

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example';

// NH-44 Center Point (Near Delhi)
const CENTER_LAT = 28.7041;
const CENTER_LNG = 77.1025;

// Generate 20 pole coordinates along a straight highway line (2km stretch)
const generatePoleCoordinates = () => {
  const poles = [];
  const totalPoles = 20;
  const spacingKm = 0.1; // 100m between poles
  
  for (let i = 0; i < totalPoles; i++) {
    // Distribute poles along a diagonal line (simulating highway)
    const latOffset = (i - totalPoles / 2) * (spacingKm / 111); // ~111km per degree latitude
    const lngOffset = (i - totalPoles / 2) * (spacingKm / (111 * Math.cos(CENTER_LAT * Math.PI / 180)));
    
    poles.push({
      id: i,
      latitude: CENTER_LAT + latOffset,
      longitude: CENTER_LNG + lngOffset,
    });
  }
  
  return poles;
};

export const MapViewport = () => {
  const { poles, triggerCrash } = useSimulationStore();
  const [viewState, setViewState] = useState({
    latitude: CENTER_LAT,
    longitude: CENTER_LNG,
    zoom: 13.5,
    pitch: 0,
    bearing: 0,
  });

  const poleCoordinates = useMemo(() => generatePoleCoordinates(), []);

  // Get marker color based on pole status and mode
  const getMarkerColor = (poleId: number) => {
    const pole = poles[poleId];
    if (!pole) return '#06b6d4'; // cyan default
    
    if (pole.status === 'CRASH') return '#dc2626'; // red
    if (pole.status === 'WARNING') return '#f59e0b'; // amber warning
    if (pole.mode === 'FOG_AMBER') return '#f59e0b'; // amber fog
    if (pole.mode === 'ECO_DIM') return '#67e8f9'; // dim cyan
    
    return '#06b6d4'; // standard cyan
  };

  // Get marker size based on status
  const getMarkerSize = (poleId: number) => {
    const pole = poles[poleId];
    if (!pole) return 20;
    
    if (pole.status === 'CRASH') return 28;
    if (pole.status === 'WARNING') return 24;
    
    return 20;
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border-4 border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
      <Map
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {/* Render Pole Markers */}
        {poleCoordinates.map((coord) => {
          const pole = poles[coord.id];
          const color = getMarkerColor(coord.id);
          const size = getMarkerSize(coord.id);
          const isWarning = pole?.status === 'WARNING';
          
          return (
            <Marker
              key={coord.id}
              latitude={coord.latitude}
              longitude={coord.longitude}
              anchor="center"
              onClick={(e: any) => {
                e.originalEvent.stopPropagation();
                triggerCrash(coord.id);
              }}
            >
              <div className="relative cursor-pointer group">
                {/* Main Pole Marker */}
                <div
                  className="rounded-full transition-all duration-300 hover:scale-125 shadow-lg border-2 border-black/50"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    boxShadow: `0 0 ${size}px ${color}`,
                    animation: isWarning ? 'pulse 1.5s ease-in-out infinite' : 'none',
                  }}
                />
                
                {/* Pulse Effect for Emergency */}
                {pole?.mode === 'EMERGENCY_PULSE' && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{
                      backgroundColor: color,
                      opacity: 0.4,
                    }}
                  />
                )}
                
                {/* Pole ID Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-xs px-2 py-1 rounded font-mono whitespace-nowrap pointer-events-none">
                  Pole #{coord.id.toString().padStart(2, '0')}
                  {pole?.status === 'CRASH' && <span className="text-red-400 ml-1">CRASH</span>}
                  {pole?.status === 'WARNING' && <span className="text-amber-400 ml-1">ALERT</span>}
                </div>
              </div>
            </Marker>
          );
        })}
      </Map>

      {/* Map Overlay - Location Badge */}
      <div className="absolute top-4 left-4 bg-black/80 border border-slate-700/50 rounded px-3 py-2 backdrop-blur-sm z-10">
        <div className="text-[9px] tracking-[0.2em] text-slate-400 uppercase font-bold mb-1">
          LOCATION
        </div>
        <div className="text-xs text-cyan-400 font-mono font-bold">
          NH-44 // DELHI NCR
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          {CENTER_LAT.toFixed(4)}°N, {CENTER_LNG.toFixed(4)}°E
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 border border-cyan-700/50 rounded-lg px-4 py-2 backdrop-blur-sm z-10">
        <p className="text-xs text-cyan-400 font-mono text-center">
          ▲ CLICK ANY POLE MARKER TO SIMULATE CRASH ▲
        </p>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/80 border border-slate-700/50 rounded px-3 py-2 backdrop-blur-sm z-10 space-y-1.5">
        <div className="text-[9px] tracking-[0.2em] text-slate-400 uppercase font-bold mb-2">
          STATUS LEGEND
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]" />
          <span className="text-[10px] text-slate-300 font-mono">STANDARD</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
          <span className="text-[10px] text-slate-300 font-mono">FOG / ALERT</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#dc2626] shadow-[0_0_8px_#dc2626]" />
          <span className="text-[10px] text-slate-300 font-mono">CRASH</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#67e8f9] shadow-[0_0_8px_#67e8f9]" />
          <span className="text-[10px] text-slate-300 font-mono">ECO MODE</span>
        </div>
      </div>
    </div>
  );
};
