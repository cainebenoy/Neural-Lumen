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
  const animals = useSimulationStore((state) => state.animals);
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
      {/* Show a sample of poles (every 100th pole for visualization) */}
      <div className="absolute bottom-40 left-0 right-0 h-32 px-6 flex justify-between items-end">
        {poles.filter((_, index) => index % 100 === 0).map((pole) => (
          <Pole key={pole.id} data={pole} />
        ))}
      </div>

      {/* KINETIC TRAFFIC - Autonomous Vehicles (Cars, Trucks, Ambulances, Ghost Trucks & Wrong-Way Drivers) */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none">
        {vehicles.map((vehicle) => {
          // Lane positioning: Lane 1 (35%) vs Lane 2 (55%)
          const bottomOffset = vehicle.lane === 1 ? 35 : 55;
          const isTruck = vehicle.type === 'truck';
          const isAmbulance = vehicle.type === 'ambulance';
          const isStalled = vehicle.speed === 0; // Ghost Truck - Phantom Shield
          const isWrongWay = vehicle.speed < 0; // Wrong-Way Driver - Neural Intercept

          // Wrong-Way Driver: Black SUV with red border (the rogue)
          // Ghost Truck: Dark grey, no glow (unlit, dangerous)
          // Ambulance: white body with emergency styling
          // Truck: amber/orange, wider | Car: cyan/rose by lane, smaller
          const vehicleClasses = isWrongWay
            ? 'w-5 h-2.5 bg-black rounded border-2 border-red-600 z-50' // Black SUV, red border
            : isStalled
            ? 'w-8 h-3.5 bg-slate-700 rounded border-slate-600 z-40' // Dark, unlit truck
            : isAmbulance
            ? 'w-8 h-3.5 bg-white rounded z-50'
            : isTruck
            ? 'w-7 h-3 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] rounded'
            : vehicle.lane === 1
              ? 'w-4 h-2 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] rounded-sm'
              : 'w-4 h-2 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] rounded-sm';
          
          return (
            <motion.div
              key={vehicle.id}
              className={`absolute ${vehicleClasses} border border-white/30 pointer-events-auto`}
              animate={isWrongWay ? {
                left: `${vehicle.x_pos}%`,
                bottom: `${bottomOffset}%`,
                scale: 1,
                opacity: 1,
                boxShadow: [
                  '0 0 15px rgba(239,68,68,0.8), 0 0 30px rgba(239,68,68,0.4)',
                  '0 0 25px rgba(239,68,68,1), 0 0 50px rgba(239,68,68,0.6)',
                  '0 0 15px rgba(239,68,68,0.8), 0 0 30px rgba(239,68,68,0.4)',
                ],
              } : isAmbulance ? {
                left: `${vehicle.x_pos}%`,
                bottom: `${bottomOffset}%`,
                scale: 1,
                opacity: 1,
                boxShadow: [
                  '0 0 20px rgba(239,68,68,0.9), 0 0 40px rgba(239,68,68,0.5)',
                  '0 0 20px rgba(59,130,246,0.9), 0 0 40px rgba(59,130,246,0.5)',
                  '0 0 20px rgba(239,68,68,0.9), 0 0 40px rgba(239,68,68,0.5)',
                ],
              } : {
                left: `${vehicle.x_pos}%`,
                bottom: `${bottomOffset}%`,
                scale: 1,
                opacity: 1,
              }}
              initial={isWrongWay
                ? { left: '100%', bottom: `${bottomOffset}%`, scale: 1, opacity: 1 }
                : isStalled 
                ? { left: `${vehicle.x_pos}%`, bottom: `${bottomOffset}%`, scale: 1, opacity: 1 }
                : { left: '0%', bottom: `${bottomOffset}%`, scale: 0, opacity: 0 }
              }
              exit={{ scale: 0, opacity: 0 }}
              transition={isWrongWay ? { 
                left: { duration: 0.2, ease: "linear" },
                bottom: { duration: 0.2, ease: "linear" },
                scale: { duration: 0.3 },
                opacity: { duration: 0.3 },
                boxShadow: { duration: 0.3, repeat: Infinity, ease: "easeInOut" },
              } : isAmbulance ? { 
                left: { duration: 0.2, ease: "linear" },
                bottom: { duration: 0.2, ease: "linear" },
                scale: { duration: 0.3 },
                opacity: { duration: 0.3 },
                boxShadow: { duration: 0.4, repeat: Infinity, ease: "easeInOut" },
              } : { 
                left: { duration: 0.2, ease: "linear" },
                bottom: { duration: 0.2, ease: "linear" },
                scale: { duration: 0.3 },
                opacity: { duration: 0.3 },
              }}
            >
              {/* Wrong-Way Driver: Prohibited icon - The Rogue */}
              {isWrongWay && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-red-500 text-sm font-bold animate-pulse">
                  🚫
                </div>
              )}

              {/* Ghost Truck: Warning Icon - No headlights, broken down */}
              {isStalled && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-500 text-sm font-bold animate-pulse">
                  ⚠
                </div>
              )}

              {/* Ambulance: Red Cross & Siren Lights */}
              {isAmbulance && (
                <>
                  {/* Red Cross Symbol */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-3 h-3">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-600 -translate-y-1/2" />
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-600 -translate-x-1/2" />
                    </div>
                  </div>
                  {/* Siren Light Bar */}
                  <motion.div 
                    className="absolute -top-1 left-1 right-1 h-1 rounded-full flex justify-between"
                    animate={{ opacity: 1 }}
                  >
                    <motion.div 
                      className="w-1.5 h-1 rounded-full bg-red-500"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                    />
                    <motion.div 
                      className="w-1.5 h-1 rounded-full bg-blue-500"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                    />
                  </motion.div>
                </>
              )}

              {/* Headlight glow - NOT shown on stalled (ghost) trucks */}
              {!isStalled && (
                <div className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full blur-sm ${isAmbulance ? 'bg-white' : isTruck ? 'bg-amber-200' : 'bg-yellow-300'}`} />
              )}
              
              {/* Truck: extra rear marker lights - NOT shown on stalled trucks */}
              {isTruck && !isStalled && (
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-1 bg-red-500 rounded-full blur-sm" />
              )}

              {/* Speed trail effect */}
              {vehicle.speed > 160 && (
                <div className="absolute -right-3 top-0 bottom-0 w-2 bg-gradient-to-r from-current to-transparent opacity-60" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* BIO-SHIELD: Wildlife Crossing Detection */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none">
        {animals.map((animal) => {
          // Animals crossing at road level (middle of road)
          const bottomOffset = 45; // Center of road
          
          // Animal icons by type (using emoji for simplicity)
          const animalEmoji = animal.type === 'DEER' ? '🦌' 
            : animal.type === 'ELEPHANT' ? '🐘' 
            : '🐆'; // LEOPARD
          
          // Size based on animal type
          const sizeClass = animal.type === 'ELEPHANT' ? 'text-3xl' 
            : animal.type === 'DEER' ? 'text-2xl' 
            : 'text-xl';

          return (
            <motion.div
              key={animal.id}
              className="absolute pointer-events-auto z-40"
              animate={{
                left: `${animal.x_pos}%`,
                bottom: `${bottomOffset}%`,
                scale: 1,
                opacity: 1,
              }}
              initial={{ 
                left: `${animal.x_pos}%`, 
                bottom: `${bottomOffset}%`, 
                scale: 0.5, 
                opacity: 0 
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                left: { duration: 0.2, ease: "linear" },
                bottom: { duration: 0.2 },
                scale: { duration: 0.5 },
                opacity: { duration: 0.5 },
              }}
            >
              {/* Thermal Signature Ring - Infrared detection visual */}
              <motion.div
                className="absolute inset-0 -m-3 rounded-full border-2 border-orange-500/60"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.8, 0.3, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Secondary Thermal Ring */}
              <motion.div
                className="absolute inset-0 -m-5 rounded-full border border-orange-400/30"
                animate={{
                  scale: [1.2, 1.6, 1.2],
                  opacity: [0.5, 0.1, 0.5],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
              />
              
              {/* Animal Icon */}
              <span className={`${sizeClass} drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]`}>
                {animalEmoji}
              </span>
              
              {/* BIO-SHIELD Label */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[8px] font-bold text-emerald-400 bg-black/60 px-1 rounded">
                  BIO-SHIELD
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* FOG LAYER - Active when fog mode is enabled (manual or weather-triggered) */}
      {/* Opacity and blur scale with weather severity for realism */}
      {env.fog && (
        <div 
          className="absolute inset-0 z-15 pointer-events-none"
          style={{
            background: env.weather === 'SNOW'
              ? 'linear-gradient(to bottom, rgba(200,210,225,0.32) 0%, rgba(180,195,210,0.22) 50%, rgba(160,175,195,0.12) 100%)'
              : env.weather === 'RAIN'
              ? 'linear-gradient(to bottom, rgba(100,116,139,0.26) 0%, rgba(71,85,105,0.18) 50%, rgba(51,65,85,0.08) 100%)'
              : 'linear-gradient(to bottom, rgba(148,163,184,0.28) 0%, rgba(100,116,139,0.18) 60%, rgba(71,85,105,0.08) 100%)',
            backdropFilter: env.weather === 'SNOW' ? 'blur(2.2px)' : env.weather === 'RAIN' ? 'blur(1.8px)' : 'blur(2px)',
            transition: 'all 1s ease-in-out',
          }}
        />
      )}

      {/* WEATHER OVERLAY - Rain or Snow particle effects */}
      <WeatherOverlay />
    </div>
  );
};