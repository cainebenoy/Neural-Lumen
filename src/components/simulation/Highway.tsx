import { useSimulationStore } from '@/lib/store';
import { Pole } from './Pole';
import { WeatherOverlay } from './WeatherOverlay';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

/**
 * Highway Component - The Viewport
 * Industrial window into the Smart Highway simulation with kinetic traffic
 */
export const Highway = () => {
  const { poles, vehicles, spawnVehicle } = useSimulationStore();

  // Auto-spawn vehicles every 3-5 seconds for continuous traffic
  useEffect(() => {
    const spawnInterval = setInterval(() => {
      // Random spawn timing between 3-5 seconds
      spawnVehicle();
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(spawnInterval);
  }, [spawnVehicle]);

  return (
    <div className="relative w-full max-w-6xl h-[400px] bg-black border-8 border-slate-800 rounded-lg overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8),inset_0_4px_8px_rgba(255,255,255,0.05)]">
      
      {/* Industrial Window Border Effect */}
      <div className="absolute inset-0 z-50 pointer-events-none border-2 border-slate-700/30 rounded" />

      {/* Sky Gradient Background (Slate-900) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-900 to-slate-950" />

      {/* Sky Gradient Background (Slate-900) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-slate-900 to-slate-950" />

      {/* The Road Surface (Dark Asphalt) */}
      <div className="absolute bottom-0 w-full h-40 bg-slate-950 border-t-4 border-slate-700/50">
        
        {/* Asphalt Texture Pattern */}
        <div 
          className="absolute inset-0 opacity-30" 
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.3) 2px,
              rgba(0,0,0,0.3) 4px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.3) 2px,
              rgba(0,0,0,0.3) 4px
            )`
          }}
        />
        
        {/* Dashed Lane Markers (Center) */}
        <div className="absolute top-1/2 left-0 right-0 h-1 flex justify-around items-center -translate-y-1/2">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="w-10 h-1 bg-yellow-400/50 rounded-full" />
          ))}
        </div>
        
        {/* Road Edge Lines */}
        <div className="absolute top-2 left-0 right-0 h-0.5 bg-white/30" />
        <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-white/30" />
      </div>

      {/* POLES - The Core Simulation Elements */}
      <div className="absolute bottom-40 left-0 right-0 h-32 px-6 flex justify-between items-end">
        {poles.map((pole) => (
          <Pole key={pole.id} data={pole} />
        ))}
      </div>

      {/* KINETIC TRAFFIC - Autonomous Vehicles */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none">
        {vehicles.map((vehicle) => {
          // Lane positioning: Lane 1 (35%) vs Lane 2 (55%)
          const bottomOffset = vehicle.lane === 1 ? 35 : 55;
          // Lane color: Cyan (Lane 1) or Rose (Lane 2)
          const laneColor = vehicle.lane === 1 
            ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' 
            : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]';
          
          return (
            <motion.div
              key={vehicle.id}
              layout
              className={`absolute w-4 h-2 rounded-sm ${laneColor} border border-white/30 pointer-events-auto`}
              style={{
                left: `${vehicle.x_pos}%`,
                bottom: `${bottomOffset}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Headlight glow */}
              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 bg-yellow-300 rounded-full blur-sm" />
              
              {/* Speed trail effect */}
              {vehicle.speed > 80 && (
                <div className="absolute -right-3 top-0 bottom-0 w-2 bg-gradient-to-r from-current to-transparent opacity-60" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* FOG LAYER - Active when any pole is in FOG_AMBER mode */}
      {poles[0]?.mode === 'FOG_AMBER' && (
        <div className="absolute inset-0 z-40 pointer-events-none bg-slate-500/20 backdrop-blur-sm" />
      )}

      {/* WEATHER OVERLAY - Rain or Snow particle effects */}
      <WeatherOverlay />
    </div>
  );
};