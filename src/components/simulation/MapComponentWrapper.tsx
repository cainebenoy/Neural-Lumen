'use client';

import { MapContainer, TileLayer, CircleMarker, Tooltip, Polyline } from 'react-leaflet';
import { Pole, GeoVehicle } from '@/lib/store';
import { HIGHWAY_ROUTES } from '@/lib/constants';

export interface MapComponentWrapperProps {
  mapCenter: [number, number];
  poles: Pole[];
  geoVehicles: GeoVehicle[];
  getPoleCoordinates: (index: number) => [number, number];
  getPoleColor: (mode: string) => string;
  getMarkerRadius: (brightness: number) => number;
  formatPower: (brightness: number) => string;
  highwayRoutes: typeof HIGHWAY_ROUTES;
}

/**
 * MapComponentWrapper - Separate component for proper Leaflet rendering
 * Handles the actual MapContainer which requires proper client-side setup
 * Renders poles and vehicles across India's highway network
 */
export default function MapComponentWrapper({
  mapCenter,
  poles,
  geoVehicles,
  getPoleCoordinates,
  getPoleColor,
  getMarkerRadius,
  formatPower,
  highwayRoutes,
}: MapComponentWrapperProps) {
  /**
   * Calculate geographic coordinates for a vehicle based on its route and progress
   */
  const getVehicleCoordinates = (vehicle: GeoVehicle): [number, number] => {
    const route = highwayRoutes[vehicle.routeIndex];
    if (!route || !route.path || route.path.length === 0) {
      return [0, 0]; // Fallback
    }

    const path = route.path;
    const segmentCount = path.length - 1;
    
    // Find which segment the vehicle is on
    const segmentIndex = Math.floor(vehicle.progress * segmentCount);
    const clampedSegmentIndex = Math.min(segmentIndex, segmentCount - 1);
    const segmentProgress = (vehicle.progress * segmentCount) - clampedSegmentIndex;
    
    const startPoint = path[clampedSegmentIndex];
    const endPoint = path[Math.min(clampedSegmentIndex + 1, path.length - 1)];
    
    // Linear interpolation between waypoints
    const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress;
    const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress;
    
    // Add slight offset for lane differentiation
    const laneOffset = vehicle.lane === 1 ? 0.015 : -0.015;
    
    return [lat + laneOffset, lng + laneOffset * 0.7];
  };

  return (
    <div className="w-full h-full bg-slate-950 rounded-lg overflow-hidden shadow-2xl">
      <MapContainer
        // @ts-expect-error - react-leaflet typing issue with center prop
        center={mapCenter}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        className="z-10"
      >
        {/* CartoDB Dark Matter tile layer - cyberpunk aesthetic */}
        <TileLayer
          // @ts-expect-error - react-leaflet typing issue
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Render highway routes as polylines */}
        {highwayRoutes.map((route, index) => (
          <Polyline
            key={`route-${index}`}
            // @ts-ignore
            positions={route.path}
            pathOptions={{
              color: '#334155', // slate-700
              weight: 2,
              opacity: 0.4,
            }}
          />
        ))}

        {/* Render poles as interactive markers */}
        {poles.map((pole, index) => {
          const coords = getPoleCoordinates(index);
          const color = getPoleColor(pole.status, pole.mode);
          const radius = getMarkerRadius(pole.brightness);
          const power = formatPower(pole.brightness);

          return (
            <CircleMarker
              key={pole.id}
              // @ts-ignore
              center={coords}
              // @ts-ignore
              radius={radius}
              fillColor={color}
              color={color}
              weight={2}
              opacity={0.8}
              fillOpacity={0.6}
              className="transition-all duration-300 hover:opacity-100 hover:fill-opacity-80 cursor-pointer"
            >
              {/* @ts-ignore */}
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

        {/* Render vehicles on the map */}
        {geoVehicles.map((vehicle) => {
          const coords = getVehicleCoordinates(vehicle);
          const isTruck = vehicle.type === 'truck';
          
          // Different colors and sizes for trucks vs cars
          const vehicleColor = isTruck ? '#f59e0b' : '#06b6d4'; // Amber for trucks, cyan for cars
          const vehicleRadius = isTruck ? 3 : 2;
          
          return (
            <CircleMarker
              key={vehicle.id}
              // @ts-ignore
              center={coords}
              // @ts-ignore
              radius={vehicleRadius}
              fillColor={vehicleColor}
              color={vehicleColor}
              weight={1}
              opacity={0.9}
              fillOpacity={0.8}
            >
              {/* @ts-ignore */}
              <Tooltip>
                <div className="flex flex-col gap-0.5 p-1">
                  <span className="font-mono text-[10px] font-bold">
                    {isTruck ? '🚛 Truck' : '🚗 Car'}
                  </span>
                  <span className="font-mono text-[9px]">
                    {vehicle.speed.toFixed(0)} km/h
                  </span>
                  <span className="font-mono text-[9px] text-slate-400">
                    {highwayRoutes[vehicle.routeIndex]?.name || 'Highway'}
                  </span>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
