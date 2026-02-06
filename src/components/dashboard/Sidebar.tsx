import { useSimulationStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Truck, RotateCcw } from 'lucide-react';

export const Sidebar = () => {
  const { env, toggleFog, setWind, setTime, reset, triggerCrash } = useSimulationStore();

  return (
    <div className="w-80 h-full bg-[#1a1b1e] border-l border-[#2c2e33] flex flex-col shadow-2xl z-50">
      
      {/* Header Panel */}
      <div className="p-6 border-b border-[#2c2e33]">
        <h2 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase mb-1">Control Deck</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 font-mono text-sm">SYSTEM ONLINE</span>
        </div>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto flex-1">
        
        {/* Module 1: Weather Control */}
        <div className="bg-[#25262b] p-4 rounded-lg border border-[#373a40] shadow-lg relative group">
          <div className="absolute -top-3 left-4 bg-[#25262b] px-2 text-[10px] tracking-widest text-slate-400 uppercase">
            Weather Systems
          </div>
          
          <div className="space-y-6 mt-2">
            {/* Fog Toggle */}
            <div className="flex items-center justify-between">
              <label htmlFor="fog-toggle" className="text-slate-400 text-xs font-mono">FOG_SIM</label>
              <button 
                id="fog-toggle"
                title={env.fog ? "Disable Fog Simulation" : "Enable Fog Simulation"}
                aria-label={env.fog ? "Fog mode active - Click to disable" : "Fog mode inactive - Click to enable"}
                onClick={() => toggleFog(!env.fog)}
                className={cn(
                  "w-12 h-6 rounded-full bg-black border border-slate-700 relative transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500/50",
                  env.fog ? "border-amber-500/50" : ""
                )}
              >
                <div className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-md transition-transform duration-300",
                  env.fog ? "translate-x-6 bg-amber-500" : "bg-slate-500"
                )} />
              </button>
            </div>

            {/* Wind Slider */}
            <div className="space-y-2">
              <label htmlFor="wind-slider" className="flex justify-between text-xs text-slate-400 font-mono">
                <span>WIND</span>
                <span>{env.windSpeed} m/s</span>
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
                className="w-full h-2 bg-black rounded-full appearance-none cursor-pointer accent-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-slate-400 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-slate-400 [&::-moz-range-thumb]:rounded-sm [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Module 2: Time Travel */}
        <div className="bg-[#25262b] p-4 rounded-lg border border-[#373a40] shadow-lg relative">
           <div className="absolute -top-3 left-4 bg-[#25262b] px-2 text-[10px] tracking-widest text-slate-400 uppercase">
            Temporal Shift
          </div>
          <div className="mt-2 space-y-3">
            <label htmlFor="time-slider" className="flex justify-between text-xs text-slate-400 font-mono">
              <span>CLOCK</span>
              <span className="text-cyan-400">{String(env.time).padStart(4, '0')} HRS</span>
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
              className="w-full h-2 bg-black rounded-full appearance-none cursor-pointer accent-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:rounded-sm [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
            />
            <p className="text-[10px] text-slate-500">Drag to 0300 for Eco Mode</p>
          </div>
        </div>

        {/* Module 3: Emergency */}
        <div className="bg-[#25262b] p-4 rounded-lg border border-red-900/30 shadow-lg relative">
           <div className="absolute -top-3 left-4 bg-[#25262b] px-2 text-[10px] tracking-widest text-red-400 uppercase">
            Hazard Injection
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
             <button 
                onClick={() => triggerCrash(18)}
                title="Simulate a crash on Pole 18 and trigger mesh warning cascade"
                aria-label="Simulate crash event"
                className="h-12 bg-red-950/50 border border-red-900 text-red-500 text-xs font-bold rounded hover:bg-red-900/50 active:scale-95 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500/50"
             >
                <Truck size={14} />
                CRASH
             </button>
             <button 
                onClick={reset}
                title="Reset simulation to initial default state"
                aria-label="Reset simulation"
                className="h-12 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-500/50"
             >
                <RotateCcw size={14} />
                RESET
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};