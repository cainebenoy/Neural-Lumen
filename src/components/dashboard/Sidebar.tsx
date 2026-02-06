import { useSimulationStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Truck, CloudFog, Wind as WindIcon, Clock, Car, Cloud, CloudSnow, Zap, TrafficCone, Eye } from 'lucide-react';
import { PowerGraph } from './PowerGraph';

/**
 * Sidebar Component - The Control Deck
 * Skeuomorphic operator console for simulation control
 */
export const Sidebar = () => {
  const { env, vehicles, autoTraffic, gridFailure, toggleFog, setWind, setTime, setWeather, triggerCrash, spawnVehicle, spawnTrafficJam, toggleAutoTraffic, triggerGridFailure } = useSimulationStore();

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
                title="Toggle Fog Mode"
                aria-label="Toggle Fog Mode"
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
                aria-label="Wind speed control"
                title="Adjust wind speed"
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

            {/* Visibility Indicator Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 text-[10px] font-mono font-bold flex items-center gap-1.5">
                  <Eye size={12} className={env.visibility >= 80 ? 'text-emerald-400' : env.visibility >= 50 ? 'text-amber-400' : 'text-red-400'} />
                  VISIBILITY
                </label>
                <span className={`text-[10px] font-mono font-bold ${
                  env.visibility >= 80 ? 'text-emerald-400' : env.visibility >= 50 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {env.visibility}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full border border-slate-700 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                <div 
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${env.visibility}%`,
                    background: env.visibility >= 80 
                      ? 'linear-gradient(to right, #10b981, #34d399)' 
                      : env.visibility >= 50 
                      ? 'linear-gradient(to right, #f59e0b, #fbbf24)' 
                      : 'linear-gradient(to right, #ef4444, #f87171)',
                    boxShadow: env.visibility >= 80 
                      ? '0 0 8px rgba(16,185,129,0.6)' 
                      : env.visibility >= 50 
                      ? '0 0 8px rgba(245,158,11,0.6)' 
                      : '0 0 8px rgba(239,68,68,0.6)',
                  }}
                />
              </div>
              <p className="text-[8px] text-slate-600 font-mono">
                {env.fog && env.weather !== 'CLEAR' 
                  ? `${env.weather} + FOG — Lights at max for safety` 
                  : env.fog 
                  ? 'FOG — Amber mode active' 
                  : env.weather !== 'CLEAR' 
                  ? `${env.weather} conditions detected`
                  : 'Conditions clear'}
              </p>
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
              aria-label="Time of day control"
              title="Adjust time of day"
              value={env.time}
              onChange={(e) => setTime(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-full appearance-none cursor-pointer border border-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-cyan-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
            <p className="text-[9px] text-slate-500 font-mono mt-1">
              {(() => {
                const t = env.time;
                if (t >= 600 && t <= 1800) return '0600-1800 = DAYTIME (lights OFF)';
                if (t >= 100 && t <= 400) return '0100-0400 = ECO MODE (30%)';
                return 'Night mode active';
              })()}
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
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-mono text-[10px]">{vehicles.filter(v => v.type === 'car').length} cars</span>
                <span className="text-amber-400 font-mono text-[10px]">{vehicles.filter(v => v.type === 'truck').length} trucks</span>
              </div>
            </div>

            {/* Auto-Traffic Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-slate-300 text-sm font-mono font-bold flex items-center gap-2">
                <Car size={16} className="text-cyan-400" />
                AUTO FLOW
              </label>
              <button 
                onClick={toggleAutoTraffic}
                title="Toggle Auto-Traffic"
                aria-label="Toggle Auto-Traffic Mode"
                className={cn(
                  "w-12 h-6 rounded-full relative transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border-2",
                  autoTraffic 
                    ? "bg-cyan-600/30 border-cyan-500" 
                    : "bg-slate-800 border-slate-600"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full shadow-md transition-all duration-300",
                  autoTraffic 
                    ? "right-0.5 bg-cyan-500" 
                    : "left-0.5 bg-slate-500"
                )} />
              </button>
            </div>

            {/* Spawn Buttons - Car & Truck */}
            <div className="flex gap-2">
              <button 
                onClick={() => spawnVehicle('car')}
                className="flex-1 h-14 bg-gradient-to-b from-cyan-900/40 to-cyan-950/60 border-2 border-cyan-800 text-cyan-400 font-bold rounded hover:from-cyan-800/50 hover:to-cyan-900/70 hover:border-cyan-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 shadow-[0_4px_0_#164e63,0_6px_12px_rgba(0,0,0,0.6)]"
              >
                <Car size={16} className="drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                <span className="text-[10px] tracking-[0.15em]">SPAWN CAR</span>
              </button>
              <button 
                onClick={() => spawnVehicle('truck')}
                className="flex-1 h-14 bg-gradient-to-b from-amber-900/40 to-amber-950/60 border-2 border-amber-800 text-amber-400 font-bold rounded hover:from-amber-800/50 hover:to-amber-900/70 hover:border-amber-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 shadow-[0_4px_0_#78350f,0_6px_12px_rgba(0,0,0,0.6)]"
              >
                <Truck size={16} className="drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                <span className="text-[10px] tracking-[0.15em]">SPAWN TRUCK</span>
              </button>
            </div>

            <p className="text-[9px] text-slate-600 font-mono text-center">
              {autoTraffic ? 'Auto-traffic enabled (~3% spawn rate)' : 'Manual spawn mode'}
            </p>

            {/* Traffic Jam Button */}
            <button 
              onClick={spawnTrafficJam}
              className="w-full h-12 bg-gradient-to-b from-violet-900/40 to-violet-950/60 border-2 border-violet-800 text-violet-400 font-bold rounded hover:from-violet-800/50 hover:to-violet-900/70 hover:border-violet-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_4px_0_#4c1d95,0_6px_12px_rgba(0,0,0,0.6)]"
            >
              <TrafficCone size={16} className="drop-shadow-[0_0_6px_rgba(167,139,250,0.6)]" />
              <span className="text-[10px] tracking-[0.15em]">SPAWN TRAFFIC JAM</span>
            </button>
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

          {/* Grid Failure */}
          <button 
            onClick={triggerGridFailure}
            className={cn(
              "w-full h-14 mt-3 border-2 font-bold rounded active:scale-95 transition-all flex flex-col items-center justify-center gap-1.5 shadow-[0_4px_0_#78350f,0_6px_12px_rgba(0,0,0,0.6)]",
              gridFailure
                ? "bg-gradient-to-b from-orange-700/60 to-orange-950/70 border-orange-500 text-orange-300"
                : "bg-gradient-to-b from-orange-900/40 to-orange-950/60 border-orange-800 text-orange-400 hover:from-orange-800/50 hover:to-orange-900/70 hover:border-orange-700"
            )}
          >
            <Zap size={18} className="drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
            <span className="text-[10px] tracking-[0.2em]">{gridFailure ? 'RESTORE GRID' : 'GRID FAILURE'}</span>
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