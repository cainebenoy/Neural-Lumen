import { useSimulationStore } from '@/lib/store';
import { Pole } from './Pole';
import { WeatherOverlay } from './WeatherOverlay';
import { motion } from 'framer-motion';

/**
 * Highway Component - The Viewport
 * Industrial window into the Smart Highway simulation with kinetic traffic
 */
export const Highway = () => {
  // Use individual selectors to avoid unnecessary re-renders on every state change
  const poles = useSimulationStore((state) => state.poles);
  const vehicles = useSimulationStore((state) => state.vehicles);
  const env = useSimulationStore((state) => state.env);

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
        
        {/* Asphalt Texture Pattern - using utility class instead of inline styles */}
        <div className="absolute inset-0 opacity-30 bg-asphalt-pattern" />
        
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

      {/* KINETIC TRAFFIC - Autonomous Vehicles (Cars & Trucks) */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none">
        {vehicles.map((vehicle) => {
          // Lane positioning: Lane 1 (35%) vs Lane 2 (55%)
          const bottomOffset = vehicle.lane === 1 ? 35 : 55;
          const isTruck = vehicle.type === 'truck';

          // Truck: amber/orange, wider | Car: cyan/rose by lane, smaller
          const vehicleClasses = isTruck
            ? 'w-7 h-3 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] rounded'
            : vehicle.lane === 1
              ? 'w-4 h-2 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] rounded-sm'
              : 'w-4 h-2 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] rounded-sm';
          
          return (
            <motion.div
              key={vehicle.id}
              className={`absolute ${vehicleClasses} border border-white/30 pointer-events-auto`}
              animate={{
                left: `${vehicle.x_pos}%`,
                bottom: `${bottomOffset}%`,
                scale: 1,
                opacity: 1,
              }}
              initial={{ left: '0%', bottom: `${bottomOffset}%`, scale: 0, opacity: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                left: { duration: 0.2, ease: "linear" },
                bottom: { duration: 0.2, ease: "linear" },
                scale: { duration: 0.3 },
                opacity: { duration: 0.3 },
              }}
            >
              {/* Headlight glow */}
              <div className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full blur-sm ${isTruck ? 'bg-amber-200' : 'bg-yellow-300'}`} />
              
              {/* Truck: extra rear marker lights */}
              {isTruck && (
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-red-500 rounded-full blur-sm" />
              )}

              {/* Speed trail effect */}
              {vehicle.speed > 80 && (
                <div className="absolute -right-3 top-0 bottom-0 w-2 bg-gradient-to-r from-current to-transparent opacity-60" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* FOG LAYER - Active when fog mode is enabled (manual or weather-triggered) */}
      {/* Opacity and blur scale with weather severity for realism */}
      {env.fog && (
        <div 
          className="absolute inset-0 z-40 pointer-events-none"
          style={{
            background: env.weather === 'SNOW'
              ? 'linear-gradient(to bottom, rgba(200,210,225,0.35) 0%, rgba(180,195,210,0.25) 50%, rgba(160,175,195,0.15) 100%)'
              : env.weather === 'RAIN'
              ? 'linear-gradient(to bottom, rgba(100,116,139,0.3) 0%, rgba(71,85,105,0.2) 50%, rgba(51,65,85,0.1) 100%)'
              : 'linear-gradient(to bottom, rgba(148,163,184,0.25) 0%, rgba(100,116,139,0.15) 60%, transparent 100%)',
            backdropFilter: env.weather === 'SNOW' ? 'blur(3px)' : env.weather === 'RAIN' ? 'blur(2px)' : 'blur(1.5px)',
            transition: 'all 1s ease-in-out',
          }}
        />
      )}

      {/* WEATHER OVERLAY - Rain or Snow particle effects */}
      <WeatherOverlay />
    </div>
  );
};