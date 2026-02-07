"use client";

import { useEffect, useState, useCallback } from 'react';
import { Highway } from '@/components/simulation/Highway';
// import { MapViewport } from '@/components/simulation/MapViewport';
import { GeoMap } from '@/components/simulation/GeoMap';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { NotificationContainer } from '@/components/ui/Notifications';
import { useSimulationStore } from '@/lib/store';
import { Activity, Map, Grid3x3, Globe, Wifi, WifiOff, Gauge, Eye, Pause, Play } from 'lucide-react';

/**
 * Neural-Lumen Main Page
 * Smart Highway Lighting Digital Twin Simulation
 */
export default function Home() {
  // Use selector to avoid re-renders on unrelated state changes
  const metrics = useSimulationStore((state) => state.metrics);
  const poles = useSimulationStore((state) => state.poles);
  const gridFailure = useSimulationStore((state) => state.gridFailure);
  const env = useSimulationStore((state) => state.env);
  const tick = useSimulationStore((state) => state.tick);
  const [viewMode, setViewMode] = useState<'simulation' | 'geo'>('simulation');
  const [isPaused, setIsPaused] = useState(false);

  // Memoize tick function to prevent interval reset
  const handleTick = useCallback(() => {
    if (!isPaused) {
      tick();
    }
  }, [tick, isPaused]);

  // Simulation Loop: Call tick() every 200ms for smooth vehicle animation
  // (5x per second — each tick moves vehicles 1/5th of a 1-second step)
  useEffect(() => {
    const interval = setInterval(() => handleTick(), 200);
    return () => clearInterval(interval);
  }, [handleTick]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <main className="flex h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-200 overflow-hidden">
      
      {/* Notification Toasts */}
      <NotificationContainer />
      
      {/* LEFT SIDE: Main Viewport */}
      <div className="flex-1 flex flex-col p-6">
        
        {/* HEADER: Top Status Bar */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3 mb-2">
              <Activity className="text-cyan-400" size={32} />
              NEURAL-LUMEN
              <span className="text-xs bg-slate-800/60 px-3 py-1 rounded text-slate-400 font-mono tracking-widest border border-slate-700/50">
                v1.0
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-mono tracking-wide">
              Smart Highway Lighting System // Digital Twin Simulation
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Pause/Play Toggle */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                isPaused
                  ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-emerald-600/20 border-emerald-600 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              }`}
              title={isPaused ? 'Resume simulation (Space)' : 'Pause simulation (Space)'}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              <span className="text-xs font-mono font-bold">{isPaused ? 'PAUSED' : 'LIVE'}</span>
            </button>

            {/* View Toggle */}
            <div className="flex gap-2 bg-slate-900/80 border-2 border-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('geo')}
              className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
                viewMode === 'geo'
                  ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Geospatial map view"
            >
              <Globe size={16} />
              <span className="text-xs font-mono font-bold">GEO</span>
            </button>
            <button
              onClick={() => setViewMode('simulation')}
              className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
                viewMode === 'simulation'
                  ? 'bg-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Linear simulation view"
            >
              <Grid3x3 size={16} />
              <span className="text-xs font-mono font-bold">SIM</span>
            </button>
          </div>
        </div>
        </div>

        {/* CENTER: Dynamic Viewport */}
        <div className="flex-1 flex items-center justify-center">
          {viewMode === 'geo' && <GeoMap />}
          {viewMode === 'simulation' && <Highway />}
        </div>

        {/* HUD: Digital LCD Readout Metrics */}
        <div className="mt-6 grid grid-cols-5 gap-4">
          
          {/* Power Draw */}
          <div className="bg-slate-900/80 border-2 border-slate-700/50 rounded-lg p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.6)]">
            <div className="text-[9px] tracking-[0.3em] text-slate-500 uppercase font-bold mb-2 font-mono">
              Power Draw
            </div>
            <div className="font-mono text-3xl text-amber-400 drop-shadow-[0_0_16px_rgba(251,191,36,0.6)] tabular-nums">
              {metrics.powerDraw.toFixed(2)} 
              <span className="text-sm text-slate-500 ml-1">kW</span>
            </div>
            <div className="text-xs text-slate-600 mt-2 font-mono">
              Baseline: 300.00 kW
            </div>
          </div>

          {/* Carbon Credits */}
          <div className="bg-slate-900/80 border-2 border-slate-700/50 rounded-lg p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.6)]">
            <div className="text-[9px] tracking-[0.3em] text-slate-500 uppercase font-bold mb-2 font-mono">
              Carbon Credits
            </div>
            <div className="font-mono text-3xl text-emerald-400 drop-shadow-[0_0_16px_rgba(16,185,129,0.6)] tabular-nums">
              {metrics.carbonCredits.toFixed(4)}
            </div>
            <div className="text-xs text-slate-600 mt-2 font-mono">
              Real-time accumulation
            </div>
          </div>

          {/* Nodes Active - System Health */}
          <div className="bg-slate-900/80 border-2 border-slate-700/50 rounded-lg p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.6)]">
            <div className="text-[9px] tracking-[0.3em] text-slate-500 uppercase font-bold mb-2 font-mono">
              Nodes Active
            </div>
            <div className="font-mono text-3xl tabular-nums flex items-center gap-2">
              <span className={poles.filter(p => p.status === 'ACTIVE').length === poles.length ? 'text-emerald-400 drop-shadow-[0_0_16px_rgba(16,185,129,0.6)]' : 'text-amber-400 drop-shadow-[0_0_16px_rgba(251,191,36,0.6)]'}>
                {poles.filter(p => p.status === 'ACTIVE').length}
              </span>
              <span className="text-sm text-slate-600">/{poles.length}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {gridFailure 
                ? <><WifiOff size={10} className="text-orange-400" /><span className="text-xs text-orange-400 font-mono">BATTERY BACKUP</span></>
                : <><Wifi size={10} className="text-emerald-500" /><span className="text-xs text-emerald-500 font-mono">Grid Online</span></>
              }
            </div>
          </div>

          {/* Uptime */}
          <div className="bg-slate-900/80 border-2 border-slate-700/50 rounded-lg p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.6)]">
            <div className="text-[9px] tracking-[0.3em] text-slate-500 uppercase font-bold mb-2 font-mono">
              System Uptime
            </div>
            <div className="font-mono text-3xl tabular-nums">
              <span className={(() => {
                const pct = (poles.filter(p => p.status === 'ACTIVE').length / poles.length) * 100;
                if (pct === 100) return 'text-emerald-400 drop-shadow-[0_0_16px_rgba(16,185,129,0.6)]';
                if (pct >= 70) return 'text-amber-400 drop-shadow-[0_0_16px_rgba(251,191,36,0.6)]';
                return 'text-red-400 drop-shadow-[0_0_16px_rgba(239,68,68,0.6)]';
              })()}>
                {((poles.filter(p => p.status === 'ACTIVE').length / poles.length) * 100).toFixed(0)}
              </span>
              <span className="text-sm text-slate-500 ml-1">%</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <Gauge size={10} className="text-slate-500" />
              <span className="text-xs text-slate-600 font-mono">
                {poles.filter(p => p.status === 'CRASH').length} crashed, {poles.filter(p => p.status === 'WARNING').length} warning
              </span>
            </div>
          </div>

          {/* Visibility & Mode */}
          <div className="bg-slate-900/80 border-2 border-slate-700/50 rounded-lg p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.6)]">
            <div className="text-[9px] tracking-[0.3em] text-slate-500 uppercase font-bold mb-2 font-mono">
              Visibility
            </div>
            <div className="font-mono text-3xl tabular-nums">
              <span className={(() => {
                if (env.visibility >= 80) return 'text-emerald-400 drop-shadow-[0_0_16px_rgba(16,185,129,0.6)]';
                if (env.visibility >= 50) return 'text-amber-400 drop-shadow-[0_0_16px_rgba(251,191,36,0.6)]';
                return 'text-red-400 drop-shadow-[0_0_16px_rgba(239,68,68,0.6)]';
              })()}>
                {env.visibility}
              </span>
              <span className="text-sm text-slate-500 ml-1">%</span>
            </div>
            {/* Current Mode Indicator */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                gridFailure ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                env.fog ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                env.time >= 600 && env.time <= 1800 ? 'bg-slate-600/20 text-slate-400 border border-slate-500/30' :
                env.time >= 100 && env.time <= 400 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {gridFailure ? 'BATTERY' :
                 env.fog ? 'FOG AMBER' :
                 env.time >= 600 && env.time <= 1800 ? 'DAYTIME' :
                 env.time >= 100 && env.time <= 400 ? 'ECO DIM' :
                 'STANDARD'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE: Control Sidebar */}
      <Sidebar />

    </main>
  );
}