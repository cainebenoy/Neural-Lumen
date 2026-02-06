'use client';

import { useState, useMemo } from 'react';
// import Map, { Marker, ViewStateChangeEvent } from 'react-map-gl';
import { useSimulationStore } from '@/lib/store';
// import 'mapbox-gl/dist/mapbox-gl.css';

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
    <div className="relative w-full h-full rounded-lg overflow-hidden border-4 border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-slate-950 flex items-center justify-center">
      <div className="text-slate-400 text-center">
        <p className="text-xs font-mono mb-2">MapViewport Component Disabled</p>
        <p className="text-[10px] text-slate-600">react-map-gl has been disabled. Use GeoMap component instead.</p>
      </div>
    </div>
  );
};
