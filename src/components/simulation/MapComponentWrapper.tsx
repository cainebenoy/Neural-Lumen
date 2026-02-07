'use client';

import { MapContainer, TileLayer, CircleMarker, Tooltip, Polyline, Circle, Marker } from 'react-leaflet';
import { Pole, GeoVehicle, Vehicle, Animal, WeatherType } from '@/lib/store';
import { HIGHWAY_ROUTES, MAJOR_CITIES, WILDLIFE_CORRIDORS, ROUTE_COLORS } from '@/lib/constants';
import { divIcon } from 'leaflet';

export interface MapComponentWrapperProps {
  mapCenter: [number, number];
  poles: Pole[];
  geoVehicles: GeoVehicle[];
  vehicles: Vehicle[];
  animals: Animal[];
  weather: WeatherType;
  fog: boolean;
  gridFailure: boolean;
  getPoleCoordinates: (index: number) => [number, number];
  getPoleColor: (status: string, mode: string) => string;
  getMarkerRadius: (brightness: number) => number;
  formatPower: (brightness: number) => string;
  highwayRoutes: typeof HIGHWAY_ROUTES;
  majorCities: typeof MAJOR_CITIES;
  wildlifeCorridors: typeof WILDLIFE_CORRIDORS;
  routeColors: typeof ROUTE_COLORS;
}

/**
 * MapComponentWrapper - Separate component for proper Leaflet rendering
 * Handles the actual MapContainer which requires proper client-side setup
 * Renders poles, vehicles, cities, wildlife corridors, and weather zones across India's highway network
 */
export default function MapComponentWrapper({
  mapCenter,
  poles,
  geoVehicles,
  vehicles,
  animals,
  weather,
  fog,
  gridFailure,
  getPoleCoordinates,
  getPoleColor,
  getMarkerRadius,
  formatPower,
  highwayRoutes,
  majorCities,
  wildlifeCorridors,
  routeColors,
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

  // Get weather overlay color based on current conditions
  const getWeatherOverlayColor = (): string => {
    if (weather === 'SNOW') return 'rgba(200, 220, 240, 0.15)';
    if (weather === 'RAIN') return 'rgba(100, 150, 200, 0.12)';
    if (fog) return 'rgba(150, 160, 170, 0.10)';
    return 'transparent';
  };

  // Check for active incidents in 2D highway view
  const activeAmbulances = vehicles.filter(v => v.type === 'ambulance');
  const stalledVehicles = vehicles.filter(v => v.speed === 0);
  const wrongWayDrivers = vehicles.filter(v => v.speed < 0);
  const crashedPoles = poles.filter(p => p.status === 'CRASH');

  // Create custom city icon
  const createCityIcon = (name: string, population: string) => divIcon({
    className: 'city-marker',
    html: `<div style="
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid #475569;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 9px;
      font-family: monospace;
      color: #94a3b8;
      white-space: nowrap;
      text-shadow: 0 0 4px rgba(0,0,0,0.8);
    ">
      <span style="color: #22d3ee; font-weight: bold;">${name}</span>
      <span style="color: #64748b; font-size: 8px;"> ${population}</span>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

  return (
    <div className="w-full h-full bg-slate-950 rounded-lg overflow-hidden shadow-2xl">
      <MapContainer
        center={mapCenter}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        className="z-10"
      >
        {/* CartoDB Dark Matter tile layer - cyberpunk aesthetic */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Render highway routes as polylines */}
        {highwayRoutes.map((route, index) => {
          // Determine route color based on name
          let routeColor = routeColors.secondary;
          if (route.name.includes('NH44') || route.name.includes('NH48')) {
            routeColor = routeColors.primary;
          } else if (route.name.includes('Coastal') || route.name.includes('East Coast')) {
            routeColor = routeColors.coastal;
          } else if (route.name.includes('Himalayan') || route.name.includes('Mountain')) {
            routeColor = routeColors.mountain;
          }
          
          return (
            <Polyline
              key={`route-${index}`}
              // @ts-ignore
              positions={route.path}
              pathOptions={{
                color: routeColor,
                weight: 2,
                opacity: 0.5,
              }}
            />
          );
        })}

        {/* Wildlife Corridors - Green eco-sensitive zones */}
        {wildlifeCorridors.map((corridor, index) => (
          <Circle
            key={`wildlife-${index}`}
            // @ts-ignore
            center={corridor.center}
            // @ts-ignore
            radius={corridor.radius}
            pathOptions={{
              color: '#10b981',
              fillColor: '#10b981',
              fillOpacity: animals.length > 0 ? 0.15 : 0.08,
              weight: 1,
              opacity: animals.length > 0 ? 0.6 : 0.3,
              dashArray: '5, 10',
            }}
          >
            {/* @ts-ignore */}
            <Tooltip>
              <div className="flex flex-col gap-0.5 p-1">
                <span className="font-mono text-[10px] font-bold text-emerald-400">
                  🌲 {corridor.name}
                </span>
                <span className="font-mono text-[9px] text-slate-400">
                  Species: {corridor.species.join(', ')}
                </span>
                <span className="font-mono text-[8px] text-emerald-500">
                  BIO-SHIELD ZONE
                </span>
              </div>
            </Tooltip>
          </Circle>
        ))}

        {/* City Markers */}
        {majorCities.map((city, index) => (
          <Marker
            key={`city-${index}`}
            // @ts-ignore
            position={city.coords}
            // @ts-ignore
            icon={createCityIcon(city.name, city.population)}
          />
        ))}

        {/* Weather Overlay - Semi-transparent zone over entire map */}
        {(weather !== 'CLEAR' || fog) && (
          <Circle
            // @ts-ignore
            center={mapCenter}
            // @ts-ignore
            radius={2000000}
            pathOptions={{
              color: 'transparent',
              fillColor: weather === 'SNOW' ? '#cbd5e1' : weather === 'RAIN' ? '#64748b' : '#94a3b8',
              fillOpacity: weather === 'SNOW' ? 0.08 : weather === 'RAIN' ? 0.06 : 0.05,
              weight: 0,
            }}
          />
        )}

        {/* Grid Failure Overlay - Orange tint when grid is down */}
        {gridFailure && (
          <Circle
            // @ts-ignore
            center={mapCenter}
            // @ts-ignore
            radius={2000000}
            pathOptions={{
              color: 'transparent',
              fillColor: '#f97316',
              fillOpacity: 0.05,
              weight: 0,
            }}
          />
        )}

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
          const isAmbulance = vehicle.type === 'ambulance';
          
          // Different colors and sizes for vehicle types
          let vehicleColor = isTruck ? '#f59e0b' : '#06b6d4';
          let vehicleRadius = isTruck ? 3 : 2;
          
          if (isAmbulance) {
            vehicleColor = '#ef4444';
            vehicleRadius = 4;
          }
          
          return (
            <CircleMarker
              key={vehicle.id}
              // @ts-ignore
              center={coords}
              // @ts-ignore
              radius={vehicleRadius}
              fillColor={vehicleColor}
              color={isAmbulance ? '#3b82f6' : vehicleColor}
              weight={isAmbulance ? 2 : 1}
              opacity={0.9}
              fillOpacity={0.8}
            >
              {/* @ts-ignore */}
              <Tooltip>
                <div className="flex flex-col gap-0.5 p-1">
                  <span className="font-mono text-[10px] font-bold">
                    {isAmbulance ? '🚑 Ambulance' : isTruck ? '🚛 Truck' : '🚗 Car'}
                  </span>
                  <span className="font-mono text-[9px]">
                    {vehicle.speed.toFixed(0)} km/h
                  </span>
                  <span className="font-mono text-[9px] text-slate-400">
                    {highwayRoutes[vehicle.routeIndex]?.name || 'Highway'}
                  </span>
                  {isAmbulance && (
                    <span className="font-mono text-[8px] text-blue-400">
                      GOLDEN HOUR PROTOCOL
                    </span>
                  )}
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Incident Markers - Crashed Poles */}
        {crashedPoles.slice(0, 10).map((pole) => {
          const coords = getPoleCoordinates(pole.id);
          return (
            <CircleMarker
              key={`crash-${pole.id}`}
              // @ts-ignore
              center={coords}
              // @ts-ignore
              radius={8}
              fillColor="#dc2626"
              color="#fef2f2"
              weight={2}
              opacity={0.9}
              fillOpacity={0.7}
              className="animate-pulse"
            >
              {/* @ts-ignore */}
              <Tooltip>
                <div className="flex flex-col gap-0.5 p-1">
                  <span className="font-mono text-[10px] font-bold text-red-400">
                    ⚠️ INCIDENT
                  </span>
                  <span className="font-mono text-[9px]">
                    Pole #{pole.id}
                  </span>
                  <span className="font-mono text-[8px] text-red-500">
                    Status: {pole.status}
                  </span>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Emergency Ring overlays for active incidents */}
        {activeAmbulances.length > 0 && (
          <Circle
            // @ts-ignore
            center={[23.5, 80.0]}
            // @ts-ignore
            radius={500000}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.03,
              weight: 1,
              opacity: 0.4,
              dashArray: '10, 5',
            }}
          />
        )}

        {/* Wrong-way driver warning zones */}
        {wrongWayDrivers.length > 0 && (
          <Circle
            // @ts-ignore
            center={[23.5, 80.0]}
            // @ts-ignore
            radius={400000}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.04,
              weight: 2,
              opacity: 0.6,
              dashArray: '5, 5',
            }}
          />
        )}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 border border-slate-700 rounded-lg p-3 shadow-xl">
        <div className="text-[9px] text-slate-400 font-mono font-bold mb-2 tracking-wider">LEGEND</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: routeColors.primary }}></div>
            <span className="text-[8px] text-slate-400 font-mono">Major Highways</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: routeColors.secondary }}></div>
            <span className="text-[8px] text-slate-400 font-mono">Secondary Routes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: routeColors.coastal }}></div>
            <span className="text-[8px] text-slate-400 font-mono">Coastal Highways</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500/50 border border-emerald-500"></div>
            <span className="text-[8px] text-slate-400 font-mono">Wildlife Corridors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
            <span className="text-[8px] text-slate-400 font-mono">Active Poles</span>
          </div>
          {activeAmbulances.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[8px] text-blue-400 font-mono">Emergency Active</span>
            </div>
          )}
          {gridFailure && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="text-[8px] text-orange-400 font-mono">Grid Failure</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Overlay - Top Right */}
      <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 border border-slate-700 rounded-lg p-2 shadow-xl">
        <div className="flex items-center gap-3 text-[9px] font-mono">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${weather === 'CLEAR' && !fog ? 'bg-emerald-500' : weather === 'SNOW' ? 'bg-cyan-300' : weather === 'RAIN' ? 'bg-blue-400' : 'bg-slate-400'}`}></div>
            <span className="text-slate-400">{fog ? 'FOG' : weather}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400">{geoVehicles.length}</span>
            <span className="text-slate-500">vehicles</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400">{poles.filter(p => p.brightness > 0).length}</span>
            <span className="text-slate-500">active</span>
          </div>
          {animals.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400">🦌 {animals.length}</span>
              <span className="text-slate-500">wildlife</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
