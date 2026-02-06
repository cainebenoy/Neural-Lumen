'use client';

import { useSimulationStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import type { Pole, GeoVehicle } from '@/lib/store';
import { HIGHWAY_ROUTES } from '@/lib/constants';

interface MapComponentWrapperProps {
  mapCenter: [number, number];
  poles: Pole[];
  geoVehicles: GeoVehicle[];
  getPoleCoordinates: (index: number) => [number, number];
  getPoleColor: (status: string, mode: string) => string;
  getMarkerRadius: (brightness: number) => number;
  formatPower: (brightness: number) => string;
  highwayRoutes: typeof HIGHWAY_ROUTES;
}

// Use dynamic import with properly typed components
const MapComponentWrapper = dynamic<MapComponentWrapperProps>(
  () => import('@/components/simulation/MapComponentWrapper'),
  { ssr: false }
);

/**
 * GeoMap Component - Geospatial Visualization
 * Plots poles across India's major National Highway network
 * Shows real-time lighting simulation distributed across the country
 * Uses CartoDB Dark Matter tiles for cyberpunk aesthetic
 */
export const GeoMap = () => {
  const poles = useSimulationStore((state) => state.poles);
  const geoVehicles = useSimulationStore((state) => state.geoVehicles);
  const [mounted, setMounted] = useState(false);

  // Map center: Central India for full country view
  const mapCenter: [number, number] = [23.5, 80.0];

  // Distribute poles across highways (4 poles per route)
  const polesPerRoute = Math.ceil(poles.length / HIGHWAY_ROUTES.length);

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
   * Distributes poles across India's highway network
   * Each highway segment gets an equal share of poles
   */
  const getPoleCoordinates = (index: number): [number, number] => {
    // Determine which route this pole belongs to
    const routeIndex = Math.floor(index / polesPerRoute) % HIGHWAY_ROUTES.length;
    const route = HIGHWAY_ROUTES[routeIndex];
    
    // Position along that specific route
    const positionInRoute = index % polesPerRoute;
    const segmentCount = route.path.length - 1;
    
    // Interpolate position along the route path
    const progress = positionInRoute / Math.max(1, polesPerRoute - 1);
    const segmentIndex = Math.floor(progress * segmentCount);
    const segmentProgress = (progress * segmentCount) - segmentIndex;
    
    const startPoint = route.path[Math.min(segmentIndex, route.path.length - 1)];
    const endPoint = route.path[Math.min(segmentIndex + 1, route.path.length - 1)];
    
    // Linear interpolation between waypoints
    const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress;
    const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress;
    
    // Add slight offset for lane differentiation
    const laneOffset = (index % 2 === 0 ? 0.02 : -0.02);
    
    return [lat + laneOffset, lng + laneOffset * 0.5];
  };

  /**
   * Determine marker color based on pole status and mode
   * Status takes priority for crash/warning visualization
   */
  const getPoleColor = (status: string, mode: string): string => {
    // Status colors take priority
    if (status === 'CRASH') return '#dc2626'; // Red for crash
    if (status === 'WARNING') return '#f97316'; // Orange for warning
    
    // Then check mode
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
    return 1.5 + (brightness / 100) * 2.5; // Range: 1.5-4 pixels (adjusted for 2000 poles)
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
      geoVehicles={geoVehicles}
      getPoleCoordinates={getPoleCoordinates}
      getPoleColor={(status: string, mode: string) => getPoleColor(status, mode)}
      getMarkerRadius={getMarkerRadius}
      formatPower={formatPower}
      highwayRoutes={HIGHWAY_ROUTES}
    />
  );
};
