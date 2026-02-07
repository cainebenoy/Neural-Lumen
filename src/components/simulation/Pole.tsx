import { motion } from 'framer-motion';
import { Wind } from 'lucide-react';
import { Pole as PoleType, useSimulationStore } from '@/lib/store';
import { cn } from '@/lib/utils';

/**
 * Pole Component - The Hardware
 * Visual representation of a smart highway lighting pole
 */
export const Pole = ({ data }: { data: PoleType }) => {
  const { env } = useSimulationStore();
  
  // Dynamic bulb color based on mode and status
  const getBulbColor = () => {
    if (data.brightness === 0) return 'bg-slate-800';
    if (data.status === 'CRASH') return 'bg-red-600 shadow-[0_0_20px_#dc2626]';
    if (data.status === 'WARNING') return 'bg-orange-500 shadow-[0_0_20px_#f97316]';
    if (data.mode === 'BATTERY') return 'bg-orange-400/70 shadow-[0_0_12px_#fb923c]';
    if (data.mode === 'FOG_AMBER') return 'bg-amber-500 shadow-[0_0_20px_#f59e0b]';
    if (data.mode === 'ECO_DIM') return 'bg-cyan-300/60 shadow-[0_0_12px_#67e8f9]';
    return 'bg-cyan-100 shadow-[0_0_16px_#e0f2fe]';
  };

  // Compute light cone style with inline radial gradient (Tailwind can't do dynamic opacity in class names)
  const getLightConeStyle = (): React.CSSProperties => {
    if (data.brightness === 0) return { opacity: 0 };

    const b = data.brightness / 100; // 0-1 scale

    if (data.status === 'CRASH') {
      return {
        background: `radial-gradient(ellipse at center, rgba(239,68,68,${Math.min(1, 1.2 * b)}) 0%, rgba(239,68,68,${0.6 * b}) 35%, transparent 65%)`,
        opacity: 1,
      };
    }
    if (data.status === 'WARNING') {
      return {
        background: `radial-gradient(ellipse at center, rgba(249,115,22,${Math.min(1, 1.2 * b)}) 0%, rgba(249,115,22,${0.6 * b}) 40%, transparent 70%)`,
        opacity: 1,
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      };
    }
    if (data.mode === 'FOG_AMBER') {
      // Wider spread in fog/weather to improve road visibility coverage
      // Higher brightness per-weather creates visible "safe corridor" effect
      return {
        background: `radial-gradient(ellipse at center, rgba(245,158,11,${Math.min(1, 1.15 * b)}) 0%, rgba(245,158,11,${0.65 * b}) 50%, rgba(245,158,11,${0.2 * b}) 75%, transparent 85%)`,
        opacity: 1,
      };
    }
    if (data.mode === 'BATTERY') {
      return {
        background: `radial-gradient(ellipse at center, rgba(251,146,60,${0.6 * b}) 0%, rgba(251,146,60,${0.3 * b}) 40%, transparent 60%)`,
        opacity: 0.7,
      };
    }
    if (data.mode === 'ECO_DIM') {
      return {
        background: `radial-gradient(ellipse at center, rgba(224,242,254,${0.5 * b}) 0%, rgba(224,242,254,${0.25 * b}) 50%, transparent 70%)`,
        opacity: 0.8,
      };
    }

    // STANDARD MODE: dramatic glow that reacts to vehicle proximity (brightness 80→100)
    return {
      background: `radial-gradient(ellipse at center, rgba(34,211,238,${Math.min(1, 0.9 * b)}) 0%, rgba(34,211,238,${0.45 * b}) 40%, transparent 65%)`,
      opacity: 1,
    };
  };

  return (
    <div className="relative flex flex-col items-center group">
      
      {/* 1. LIGHT CONE - Ground Projection with Radial Gradient Glow */}
      {/* transition-all duration-700 provides the smooth cross-fade per PRD */}
      <motion.div 
        className="absolute -bottom-20 w-40 h-40 pointer-events-none rounded-full blur-xl"
        style={{ ...getLightConeStyle(), transition: 'background 0.7s ease-in-out, opacity 0.7s ease-in-out' }}
        animate={
          data.mode === 'EMERGENCY_PULSE' 
            ? { opacity: [0.2, 0.8, 0.2] } 
            : {}
        }
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 2. TURBINE - Wind Energy Harvester (spins based on wind speed) */}
      <div className="mb-2 relative z-20">
        <Wind 
          size={18} 
          className={cn(
            "transition-all",
            data.brightness > 0 
              ? "text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.6)]" 
              : "text-emerald-700/40"
          )}
          style={{ 
            animation: env.windSpeed > 0 
              ? `spin ${20 / Math.max(1, env.windSpeed)}s linear infinite` 
              : 'none'
          }} 
        />
      </div>

      {/* 3. BULB HEAD - The Light Fixture */}
      <div className="relative z-20 w-6 h-6 mb-1">
        {/* Mounting Ring */}
        <div className="absolute inset-[-3px] rounded-full bg-gradient-to-br from-slate-600 to-slate-900 border border-slate-700 shadow-lg" />
        
        {/* Bulb - smooth cross-fade transition on color changes */}
        <div className={cn(
          "absolute inset-0 rounded-full border-2 border-black/50",
          getBulbColor()
        )} style={{ transition: 'background-color 0.7s ease-in-out, box-shadow 0.7s ease-in-out' }} />
        
        {/* Inner Glow Effect */}
        {data.brightness > 0 && (
          <div className={cn(
            "absolute inset-1 rounded-full blur-sm",
            data.status === 'CRASH' ? 'bg-red-400' :
            data.mode === 'BATTERY' ? 'bg-orange-300' :
            data.mode === 'FOG_AMBER' ? 'bg-amber-300' :
            'bg-cyan-200'
          )} />
        )}
      </div>

      {/* 4. PHYSICAL STICK - The Pole Structure */}
      <div className="w-2 h-28 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-900 border-x border-slate-700/50 shadow-md z-10 rounded-sm" />

      {/* 5. STATUS LED - Connectivity Health Indicator (Green=Online, Red=Offline per PRD FR-03) */}
      <div className={cn(
        "w-2 h-2 rounded-full z-20 my-0.5 transition-all duration-300",
        data.status === 'CRASH' ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse' :
        data.status === 'WARNING' ? 'bg-orange-500 shadow-[0_0_6px_#f97316]' :
        'bg-emerald-500 shadow-[0_0_6px_#10b981]'
      )} title={data.status === 'CRASH' ? 'OFFLINE' : data.status === 'WARNING' ? 'WARNING' : 'ONLINE'} />

      {/* 6. BASE PLATE */}
      <div className="w-4 h-1.5 bg-gradient-to-b from-slate-500 to-slate-700 rounded-full shadow-md z-10" />
      
      {/* 7. POLE ID - Shows on hover or in alert states */}
      <div className={cn(
        "absolute -top-6 bg-black/80 border rounded px-2 py-0.5 text-[8px] font-mono font-bold transition-opacity",
        data.status === 'CRASH' ? 'opacity-100 border-red-500 text-red-400' :
        data.status === 'WARNING' ? 'opacity-100 border-orange-500 text-orange-400' :
        'opacity-0 group-hover:opacity-100 border-slate-600 text-slate-400'
      )}>
        {data.status === 'CRASH' ? 'CRASH' : 
         data.status === 'WARNING' ? 'ALERT' : 
         `ID-${data.id.toString().padStart(2, '0')}`}
      </div>
    </div>
  );
};