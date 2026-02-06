import { motion } from 'framer-motion';
import { Wind } from 'lucide-react';
import { Pole as PoleType, useSimulationStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export const Pole = ({ data }: { data: PoleType }) => {
  const { env } = useSimulationStore();
  
  // Dynamic Styles based on Mode
  const getLightColor = () => {
    if (data.status === 'CRASH') return 'bg-red-500';
    if (data.mode === 'FOG_AMBER') return 'bg-amber-500';
    if (data.mode === 'ECO_DIM') return 'bg-cyan-100'; // Dim white
    return 'bg-cyan-200'; // Standard cool white
  };

  const getGlow = () => {
    if (data.brightness === 0) return 'opacity-0';
    if (data.status === 'CRASH') return 'bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.8)_0%,transparent_70%)] opacity-100';
    if (data.mode === 'FOG_AMBER') return 'bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.6)_0%,transparent_70%)] opacity-90';
    return 'bg-[radial-gradient(circle_at_center,rgba(165,243,252,0.4)_0%,transparent_70%)] opacity-60';
  };

  return (
    <div className="relative flex flex-col items-center group">
      {/* 1. The Light Cone (Ground Projection) */}
      <motion.div 
        className={cn(
          "absolute -bottom-16 w-32 h-32 pointer-events-none transition-all duration-700",
          getGlow()
        )}
        animate={
          data.mode === 'EMERGENCY_PULSE' 
            ? { opacity: [0.2, 0.8, 0.2], scale: [0.9, 1.1, 0.9] } 
            : {}
        }
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* 2. The Turbine (Energy Harvester) */}
      <div className="mb-1 relative z-20">
        <Wind 
          size={16} 
          className={cn("text-emerald-500/80 transition-all")}
          style={{ 
            animation: `spin ${20 / Math.max(1, env.windSpeed)}s linear infinite` 
          }} 
        />
      </div>

      {/* 3. The Pole Head (Fixture) */}
      <div className="relative z-20 w-4 h-4">
        {/* Mounting Ring */}
        <div className="absolute inset-[-2px] rounded-full bg-slate-800 border border-slate-600 shadow-sm" />
        {/* The Bulb Cap */}
        <div className={cn(
          "absolute inset-0 rounded-full border border-black/50 shadow-inner transition-colors duration-500",
          getLightColor(),
          data.brightness === 0 ? "bg-slate-800" : ""
        )} />
      </div>

      {/* 4. The Stick (Physical Pole) */}
      <div className="w-1.5 h-24 bg-gradient-to-b from-slate-700 to-slate-900 border-x border-slate-800 z-10" />

      {/* 5. Base Plate */}
      <div className="w-3 h-1 bg-slate-600 rounded-full mt-[-1px] z-10" />
      
      {/* Label (Only visible on hover) */}
      <span className="absolute -top-8 text-[9px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
        ID-{data.id}
      </span>
    </div>
  );
};