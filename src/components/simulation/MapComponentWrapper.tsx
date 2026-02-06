'use client';

import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { Pole } from '@/lib/store';

interface MapComponentWrapperProps {
  mapCenter: [number, number];
  poles: Pole[];
  getPoleCoordinates: (index: number) => [number, number];
  getPoleColor: (mode: string) => string;
  getMarkerRadius: (brightness: number) => number;
  formatPower: (brightness: number) => string;
}

/**
 * MapComponentWrapper - Separate component for proper Leaflet rendering
 * Handles the actual MapContainer which requires proper client-side setup
 */
export default function MapComponentWrapper({
  mapCenter,
  poles,
  getPoleCoordinates,
  getPoleColor,
  getMarkerRadius,
  formatPower,
}: MapComponentWrapperProps) {
  return (
    <div className="w-full h-full bg-slate-950 rounded-lg overflow-hidden shadow-2xl">
      <MapContainer
        // @ts-expect-error - react-leaflet typing issue with center prop
        center={mapCenter}
        zoom={14}
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

        {/* Render poles as interactive markers */}
        {poles.map((pole, index) => {
          const coords = getPoleCoordinates(index);
          const color = getPoleColor(pole.mode);
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
      </MapContainer>
    </div>
  );
}
