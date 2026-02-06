import { motion } from 'framer-motion';
import { Wind } from 'lucide-react';
import { Pole as PoleType, useSimulationStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export const Pole = ({ data }: { data: PoleType }) => {
  const { env } = useSimulationStore();
  
  // Dynamic Styles based on Mode
  const getLightColor = () => {
    if (data.brightness === 0) return 'bg-slate-800';
    if (data.status === 'CRASH') return 'bg-red-600 shadow-[0_0_20px_#dc2626]';
    if (data.mode === 'FOG_AMBER') return 'bg-amber-500 shadow-[0_0_20px_#f59e0b]';
    if (data.mode === 'ECO_DIM') return 'bg-cyan-300/60 shadow-[0_0_12px_#67e8f9]';
    return 'bg-cyan-100 shadow-[0_0_16px_#e0f2fe]';
  };

  const getGlow = () => {
    if (data.brightness === 0) return 'opacity-0';
    
    const brightnessScale = data.brightness / 100;
    
    if (data.status === 'CRASH') {
      return `bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,${0.9 * brightnessScale})_0%,rgba(239,68,68,${0.5 * brightnessScale})_40%,transparent_70%)] opacity-100`;
    }
    if (data.mode === 'FOG_AMBER') {
      return `bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,${0.8 * brightnessScale})_0%,rgba(245,158,11,${0.4 * brightnessScale})_50%,transparent_75%)] opacity-100`;
    }
    if (data.mode === 'ECO_DIM') {
      return `bg-[radial-gradient(ellipse_at_center,rgba(224,242,254,${0.4 * brightnessScale})_0%,rgba(224,242,254,${0.2 * brightnessScale})_50%,transparent_70%)] opacity-80`;
    }
    
    return `bg-[radial-gradient(ellipse_at_center,rgba(224,242,254,${0.7 * brightnessScale})_0%,rgba(224,242,254,${0.3 * brightnessScale})_45%,transparent_70%)] opacity-90`;
  };

  return (
    <div className="relative flex flex-col items-center group">
      
      {/* 1. The Light Cone (Ground Projection) - MUCH LARGER */}
      <motion.div 
        className={cn(
          "absolute -bottom-20 w-40 h-40 pointer-events-none transition-all duration-700 rounded-full blur-xl",
          getGlow()
        )}
        animate={
          data.mode === 'EMERGENCY_PULSE' 
            ? { opacity: [0.3, 1, 0.3], scale: [0.85, 1.15, 0.85] } 
            : {}
        }
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 2. The Turbine (Energy Harvester) */}
      <div className="mb-2 relative z-20">
        <Wind 
          size={18} 
          className={cn(
            "transition-all",
            data.brightness > 0 ? "text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]" : "text-emerald-700/40"
          )}
          style={{ 
            animation: env.windSpeed > 0 ? `spin ${20 / Math.max(1, env.windSpeed)}s linear infinite` : 'none'
          }} 
        />
      </div>

      {/* 3. The Pole Head (Fixture) - LARGER AND BRIGHTER */}
      <div className="relative z-20 w-6 h-6 mb-1">
        {/* Mounting Ring */}
        <div className="absolute inset-[-3px] rounded-full bg-gradient-to-br from-slate-600 to-slate-900 border border-slate-700 shadow-lg" />
        
        {/* The Bulb Cap */}
        <div className={cn(
          "absolute inset-0 rounded-full border-2 border-black/50 transition-all duration-500",
          getLightColor()
        )} />
        
        {/* Inner Glow */}
        {data.brightness > 0 && (
          <div className={cn(
            "absolute inset-1 rounded-full blur-sm",
            data.status === 'CRASH' ? 'bg-red-400' :
            data.mode === 'FOG_AMBER' ? 'bg-amber-300' :
            'bg-cyan-200'
          )} />
        )}
      </div>

      {/* 4. The Stick (Physical Pole) */}
      <div className="w-2 h-28 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-900 border-x border-slate-700/50 shadow-md z-10 rounded-sm" />

      {/* 5. Base Plate */}
      <div className="w-4 h-1.5 bg-gradient-to-b from-slate-500 to-slate-700 rounded-full shadow-md z-10" />
      
      {/* Status Badge (visible on hover or if in alert state) */}
      <div className={cn(
        "absolute -top-6 bg-black/80 border rounded px-2 py-0.5 text-[8px] font-mono font-bold transition-opacity",
        data.status === 'CRASH' ? 'opacity-100 border-red-500 text-red-400' :
        data.status === 'WARNING' ? 'opacity-100 border-amber-500 text-amber-400' :
        'opacity-0 group-hover:opacity-100 border-slate-600 text-slate-400'
      )}>
        {data.status === 'CRASH' ? 'CRASH' : 
         data.status === 'WARNING' ? 'ALERT' : 
         `ID-${data.id.toString().padStart(2, '0')}`}
      </div>
    </div>
  );
};