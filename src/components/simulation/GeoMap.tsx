'use client';

import { useSimulationStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import type { Pole } from '@/lib/store';

interface MapComponentWrapperProps {
  mapCenter: [number, number];
  poles: Pole[];
  getPoleCoordinates: (index: number) => [number, number];
  getPoleColor: (mode: string) => string;
  getMarkerRadius: (brightness: number) => number;
  formatPower: (brightness: number) => string;
}

// Use dynamic import with properly typed components
const MapComponentWrapper = dynamic<MapComponentWrapperProps>(
  () => import('@/components/simulation/MapComponentWrapper'),
  { ssr: false }
);

/**
 * GeoMap Component - Geospatial Visualization
 * Plots poles on a real-world map of NH-48, Delhi-Gurgaon corridor
 * Uses CartoDB Dark Matter tiles for cyberpunk aesthetic
 */
export const GeoMap = () => {
  const { poles } = useSimulationStore();
  const [mounted, setMounted] = useState(false);

  // Map center: NH-48, Delhi-Gurgaon
  const mapCenter: [number, number] = [28.5273, 77.0688];

  // Wait for client-side mounting to avoid hydration issues with Leaflet
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-slate-950 rounded-lg overflow-hidden shadow-2xl flex items-center justify-center">
        <div className="text-slate-400 font-mono">Loading map...</div>
      </div>
    );
  }
  
  /**
   * Calculate GPS coordinates for each pole
   * Simulates a 2km stretch along the highway by offsetting latitude
   * Each pole gets a progressively larger offset to space them geographically
   */
  const getPoleCoordinates = (index: number): [number, number] => {
    // Spread poles over ~2km (roughly 0.02 degrees latitude)
    const latOffset = (index / poles.length) * 0.02;
    // Slight longitude jitter for lane differentiation
    const lngOffset = (index % 2 === 0 ? 0.003 : -0.003);
    
    return [
      mapCenter[0] + latOffset,
      mapCenter[1] + lngOffset,
    ];
  };

  /**
   * Determine marker color based on pole mode
   */
  const getPoleColor = (mode: string): string => {
    switch (mode) {
      case 'EMERGENCY_PULSE':
        return '#ef4444'; // Red for emergency
      case 'FOG_AMBER':
        return '#fbbf24'; // Amber for fog
      case 'ECO_DIM':
        return '#10b981'; // Emerald for eco mode
      case 'STANDARD':
      default:
        return '#06b6d4'; // Cyan for standard
    }
  };

  /**
   * Calculate marker radius based on brightness
   * Higher brightness = larger marker (more visible)
   */
  const getMarkerRadius = (brightness: number): number => {
    return 4 + (brightness / 100) * 10; // Range: 4-14 pixels
  };

  /**
   * Format power consumption for display
   */
  const formatPower = (brightness: number): string => {
    const basePower = 150; // Base Watts per pole
    const power = (basePower * brightness) / 100;
    return power.toFixed(0);
  };

  return (
    <MapComponentWrapper
      mapCenter={mapCenter}
      poles={poles}
      getPoleCoordinates={getPoleCoordinates}
      getPoleColor={getPoleColor}
      getMarkerRadius={getMarkerRadius}
      formatPower={formatPower}
    />
  );
};
