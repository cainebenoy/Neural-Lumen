import { useSimulationStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Truck, RotateCcw, CloudFog, Clock, Wind as WindIcon } from 'lucide-react';

export const Sidebar = () => {
  const { env, toggleFog, setWind, setTime, reset, triggerCrash } = useSimulationStore();

  return (
    <div className="w-96 h-full bg-[#1a1b1e] border-l-2 border-[#2c2e33] flex flex-col shadow-[inset_4px_0_10px_rgba(0,0,0,0.5)] relative">
      
      {/* Corner Screws (Decorative) */}
      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 shadow-inner" />
      <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 shadow-inner" />
      
      {/* Header Panel */}
      <div className="p-6 border-b-2 border-[#2c2e33] bg-gradient-to-b from-[#1f2023] to-[#1a1b1e]">
        <h2 className="text-xs font-bold tracking-[0.25em] text-slate-400/80 uppercase mb-3 drop-shadow-[0_1px_0_rgba(0,0,0,0.9)]">
          Control Deck
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981,inset_0_1px_2px_rgba(255,255,255,0.3)] animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 rounded-full border border-emerald-600" />
          </div>
          <span className="text-emerald-400 font-mono text-sm font-bold tracking-wide drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
            SYSTEM ONLINE
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        
        {/* Module 1: Weather Control */}
        <div className="bg-[#25262b] p-5 rounded-lg border-2 border-[#373a40] shadow-[4px_4px_12px_rgba(0,0,0,0.6),-1px_-1px_2px_rgba(255,255,255,0.02)] relative">
          <div className="absolute -top-3 left-4 bg-[#25262b] px-3 text-[9px] tracking-[0.3em] text-slate-400/90 uppercase font-bold border-x border-[#373a40]">
            Weather Systems
          </div>
          
          <div className="space-y-5 mt-2">
            {/* Fog Toggle */}
            <div className="flex items-center justify-between">
              <label htmlFor="fog-toggle" className="text-slate-300 text-sm font-mono font-bold flex items-center gap-2">
                <CloudFog size={16} className="text-amber-500" />
                FOG_SIM
              </label>
              <button 
                id="fog-toggle"
                title={env.fog ? "Disable Fog Simulation" : "Enable Fog Simulation"}
                aria-label={env.fog ? "Fog mode active - Click to disable" : "Fog mode inactive - Click to enable"}
                onClick={() => toggleFog(!env.fog)}
                className={cn(
                  "w-14 h-7 rounded-full bg-black/80 border-2 relative transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                  env.fog ? "border-amber-500/70 bg-amber-950/30" : "border-slate-600"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all duration-300 border",
                  env.fog 
                    ? "right-0.5 bg-gradient-to-br from-amber-400 to-amber-600 border-amber-700" 
                    : "left-0.5 bg-gradient-to-br from-slate-400 to-slate-600 border-slate-700"
                )} />
              </button>
            </div>

            {/* Wind Slider */}
            <div className="space-y-2">
              <label htmlFor="wind-slider" className="flex justify-between text-sm text-slate-300 font-mono font-bold">
                <span className="flex items-center gap-2">
                  <WindIcon size={16} className="text-emerald-500" />
                  WIND
                </span>
                <span className="text-emerald-400">{env.windSpeed} m/s</span>
              </label>
              <input 
                id="wind-slider"
                type="range" 
                min="0" 
                max="30" 
                value={env.windSpeed}
                onChange={(e) => setWind(Number(e.target.value))}
                title="Adjust wind speed (0-30 m/s)"
                aria-label="Wind speed slider - affects turbine rotation and energy harvesting"
                className="w-full h-2.5 bg-black/80 rounded-full appearance-none cursor-pointer border border-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] accent-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-emerald-400 [&::-webkit-slider-thumb]:to-emerald-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.8)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-700 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-emerald-400 [&::-moz-range-thumb]:to-emerald-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-emerald-700 [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
              />
            </div>
          </div>
        </div>

        {/* Module 2: Time Travel */}
        <div className="bg-[#25262b] p-5 rounded-lg border-2 border-[#373a40] shadow-[4px_4px_12px_rgba(0,0,0,0.6),-1px_-1px_2px_rgba(255,255,255,0.02)] relative">
           <div className="absolute -top-3 left-4 bg-[#25262b] px-3 text-[9px] tracking-[0.3em] text-slate-400/90 uppercase font-bold border-x border-[#373a40]">
            Temporal Shift
          </div>
          <div className="mt-2 space-y-3">
            <label htmlFor="time-slider" className="flex justify-between text-sm text-slate-300 font-mono font-bold">
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-cyan-500" />
                CLOCK
              </span>
              <span className="text-cyan-400 font-mono text-base">{String(env.time).padStart(4, '0')} HRS</span>
            </label>
            <input 
              id="time-slider"
              type="range" 
              min="0" 
              max="2400" 
              step="100"
              value={env.time}
              onChange={(e) => setTime(Number(e.target.value))}
              title="Adjust time of day (0000-2400 hours)"
              aria-label="Time slider - Drag to 0300 for Eco Mode, 0600-1800 for daylight"
              className="w-full h-2.5 bg-black/80 rounded-full appearance-none cursor-pointer border border-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] accent-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-cyan-400 [&::-webkit-slider-thumb]:to-cyan-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.8)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cyan-700 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-gradient-to-br [&::-moz-range-thumb]:from-cyan-400 [&::-moz-range-thumb]:to-cyan-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-cyan-700 [&::-moz-range-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
            />
            <p className="text-[10px] text-slate-500 font-mono">⚡ Drag to 0300 for Eco Mode | 0600-1800 = Daylight</p>
          </div>
        </div>

        {/* Module 3: Emergency */}
        <div className="bg-[#25262b] p-5 rounded-lg border-2 border-red-900/50 shadow-[4px_4px_12px_rgba(0,0,0,0.6),-1px_-1px_2px_rgba(255,255,255,0.02),0_0_20px_rgba(220,38,38,0.1)] relative">
           <div className="absolute -top-3 left-4 bg-[#25262b] px-3 text-[9px] tracking-[0.3em] text-red-400/90 uppercase font-bold border-x border-red-900/50">
            Hazard Injection
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
             <button 
                onClick={() => triggerCrash(18)}
                title="Simulate a crash on Pole 18 and trigger mesh warning cascade"
                aria-label="Simulate crash event"
                className="h-14 bg-gradient-to-b from-red-950/60 to-red-950/80 border-2 border-red-900 text-red-400 text-xs font-bold rounded-md hover:from-red-900/60 hover:to-red-900/80 hover:border-red-800 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-red-500/50 shadow-[0_4px_0_#450a0a,0_6px_12px_rgba(0,0,0,0.8)]"
             >
                <Truck size={18} className="drop-shadow-[0_0_4px_rgba(239,68,68,0.6)]" />
                <span className="tracking-wider">CRASH</span>
             </button>
             <button 
                onClick={reset}
                title="Reset simulation to initial default state"
                aria-label="Reset simulation"
                className="h-14 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700 text-slate-300 text-xs font-bold rounded-md hover:from-slate-700 hover:to-slate-800 hover:border-slate-600 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-slate-500/50 shadow-[0_4px_0_#0f172a,0_6px_12px_rgba(0,0,0,0.8)]"
             >
                <RotateCcw size={18} />
                <span className="tracking-wider">RESET</span>
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};