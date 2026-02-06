'use client';

import { useSimulationStore } from '@/lib/store';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * GeoMap Component - Geospatial Visualization
 * Plots poles on a real-world map of NH-48, Delhi-Gurgaon corridor
 * Uses CartoDB Dark Matter tiles for cyberpunk aesthetic
 */
export const GeoMap = () => {
  const { poles } = useSimulationStore();

  // Map center: NH-48, Delhi-Gurgaon
  const mapCenter: [number, number] = [28.5273, 77.0688];
  
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
    <div className="w-full h-full bg-slate-950 rounded-lg overflow-hidden shadow-2xl">
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        className="z-10"
      >
        {/* CartoDB Dark Matter tile layer - cyberpunk aesthetic */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Render poles as interactive markers */}
        {poles.map((pole, index) => {
          const coords = getPoleCoordinates(index);
          const color = getPoleColor(pole.mode);
          const radius = getMarkerRadius(pole.brightness);
          const power = formatPower(pole.brightness);

          return (
            <CircleMarker
              key={pole.id}
              center={coords}
              radius={radius}
              fillColor={color}
              color={color}
              weight={2}
              opacity={0.8}
              fillOpacity={0.6}
              className="transition-all duration-300 hover:opacity-100 hover:fill-opacity-80 cursor-pointer"
            >
              <Tooltip sticky>
                <div className="flex flex-col gap-1 p-1">
                  <span className="font-mono text-xs font-bold">
                    Pole #{pole.id}
                  </span>
                  <span className="font-mono text-xs">
                    Power: {power}W
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {pole.mode.replace(/_/g, ' ')}
                  </span>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};
