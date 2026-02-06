import { useSimulationStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Truck, CloudFog, Wind as WindIcon, Clock, Car, Cloud, CloudSnow } from 'lucide-react';
import { PowerGraph } from './PowerGraph';

/**
 * Sidebar Component - The Control Deck
 * Skeuomorphic operator console for simulation control
 */
export const Sidebar = () => {
  const { env, vehicles, toggleFog, setWind, setTime, setWeather, triggerCrash, spawnVehicle } = useSimulationStore();

  return (
    <div className="w-80 h-full bg-[#1e1f23] border-l-4 border-slate-700 flex flex-col shadow-[inset_4px_0_12px_rgba(0,0,0,0.6)]">
      
      {/* Header */}
      <div className="p-5 border-b-2 border-slate-700/50 bg-gradient-to-b from-slate-800/30 to-transparent">
        <h2 className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase mb-2">
          Control Deck
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
          <span className="text-emerald-400 font-mono text-xs font-bold tracking-wider">
            ONLINE
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5 overflow-y-auto flex-1">
        
        {/* MODULE 1: Weather Control */}
        <div className="bg-slate-900/50 p-4 rounded border-2 border-slate-700/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_4px_8px_rgba(0,0,0,0.4)]">
          <div className="text-[10px] tracking-[0.2em] text-slate-400 uppercase font-bold mb-4 pb-2 border-b border-slate-700/50">
            Weather Systems
          </div>
          
          <div className="space-y-4">
            {/* Fog Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-slate-300 text-sm font-mono font-bold flex items-center gap-2">
                <CloudFog size={16} className="text-amber-400" />
                FOG MODE
              </label>
              <button 
                onClick={toggleFog}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border-2",
                  env.fog 
                    ? "bg-amber-600/30 border-amber-500" 
                    : "bg-slate-800 border-slate-600"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full shadow-md transition-all duration-300",
                  env.fog 
                    ? "right-0.5 bg-amber-500" 
                    : "left-0.5 bg-slate-500"
                )} />
              </button>
            </div>

            {/* Wind Slider */}
            <div className="space-y-2">
              <label className="flex justify-between text-sm text-slate-300 font-mono font-bold">
                <span className="flex items-center gap-2">
                  <WindIcon size={16} className="text-emerald-400" />
                  WIND
                </span>
                <span className="text-emerald-400">{env.windSpeed} m/s</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="30" 
                value={env.windSpeed}
                onChange={(e) => setWind(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-full appearance-none cursor-pointer border border-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-emerald-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              />
            </div>

            {/* Weather Control */}
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-mono font-bold">
                WEATHER
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setWeather('CLEAR')}
                  className={cn(
                    "flex-1 py-2 px-2 rounded text-xs font-mono border-2 transition-all",
                    env.weather === 'CLEAR'
                      ? 'bg-blue-600/40 border-blue-500 text-blue-400'
                      : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:border-slate-500'
                  )}
                >
                  <Cloud size={14} className="mx-auto mb-1" />
                  Clear
                </button>
                <button
                  onClick={() => setWeather('RAIN')}
                  className={cn(
                    "flex-1 py-2 px-2 rounded text-xs font-mono border-2 transition-all",
                    env.weather === 'RAIN'
                      ? 'bg-cyan-600/40 border-cyan-500 text-cyan-400'
                      : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:border-slate-500'
                  )}
                >
                  <CloudFog size={14} className="mx-auto mb-1" />
                  Rain
                </button>
                <button
                  onClick={() => setWeather('SNOW')}
                  className={cn(
                    "flex-1 py-2 px-2 rounded text-xs font-mono border-2 transition-all",
                    env.weather === 'SNOW'
                      ? 'bg-blue-300/40 border-blue-300 text-blue-200'
                      : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:border-slate-500'
                  )}
                >
                  <CloudSnow size={14} className="mx-auto mb-1" />
                  Snow
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODULE 2: Time Control */}
        <div className="bg-slate-900/50 p-4 rounded border-2 border-slate-700/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_4px_8px_rgba(0,0,0,0.4)]">
          <div className="text-[10px] tracking-[0.2em] text-slate-400 uppercase font-bold mb-4 pb-2 border-b border-slate-700/50">
            Temporal Control
          </div>
          
          <div className="space-y-2">
            <label className="flex justify-between text-sm text-slate-300 font-mono font-bold">
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-cyan-400" />
                TIME
              </span>
              <span className="text-cyan-400 font-mono">{String(env.time).padStart(4, '0')}</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="2400" 
              step="100"
              value={env.time}
              onChange={(e) => setTime(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-full appearance-none cursor-pointer border border-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
            <p className="text-[9px] text-slate-500 font-mono mt-1">
              0100-0400 = ECO MODE (30% brightness)
            </p>
          </div>
        </div>

        {/* MODULE 3: Traffic Simulation */}
        <div className="bg-slate-900/50 p-4 rounded border-2 border-cyan-900/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_4px_8px_rgba(0,0,0,0.4),0_0_12px_rgba(6,182,212,0.1)]">
          <div className="text-[10px] tracking-[0.2em] text-cyan-400 uppercase font-bold mb-4 pb-2 border-b border-cyan-900/50">
            Traffic Physics
          </div>
          
          <div className="space-y-3">
            {/* Vehicle Counter */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">Active Vehicles</span>
              <span className="text-cyan-400 font-mono font-bold">{vehicles.length}</span>
            </div>

            {/* Spawn Button */}
            <button 
              onClick={spawnVehicle}
              className="w-full h-14 bg-gradient-to-b from-cyan-900/40 to-cyan-950/60 border-2 border-cyan-800 text-cyan-400 font-bold rounded hover:from-cyan-800/50 hover:to-cyan-900/70 hover:border-cyan-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 shadow-[0_4px_0_#164e63,0_6px_12px_rgba(0,0,0,0.6)]"
            >
              <Car size={18} className="drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
              <span className="text-xs tracking-[0.2em]">SPAWN VEHICLE</span>
            </button>

            <p className="text-[9px] text-slate-600 font-mono text-center">
              Auto-spawning every 3-5s
            </p>
          </div>
        </div>

        {/* MODULE 4: Hazard Testing */}
        <div className="bg-slate-900/50 p-4 rounded border-2 border-red-900/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_4px_8px_rgba(0,0,0,0.4),0_0_12px_rgba(220,38,38,0.1)]">
          <div className="text-[10px] tracking-[0.2em] text-red-400 uppercase font-bold mb-4 pb-2 border-b border-red-900/50">
            Hazard Simulation
          </div>
          
          <button 
            onClick={() => triggerCrash(18)}
            className="w-full h-16 bg-gradient-to-b from-red-900/40 to-red-950/60 border-2 border-red-800 text-red-400 font-bold rounded hover:from-red-800/50 hover:to-red-900/70 hover:border-red-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 shadow-[0_4px_0_#7f1d1d,0_6px_12px_rgba(0,0,0,0.6)]"
          >
            <Truck size={20} className="drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
            <span className="text-xs tracking-[0.2em]">CRASH TEST</span>
            <span className="text-[9px] text-red-500/70 font-mono">POLE #18</span>
          </button>
        </div>

        {/* MODULE 5: Live Telemetry Graph */}
        <div className="flex-1 min-h-0 max-h-72 bg-slate-900/50 p-4 rounded border-2 border-slate-700/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_4px_8px_rgba(0,0,0,0.4)]">
          <PowerGraph />
        </div>

      </div>
    </div>
  );
};