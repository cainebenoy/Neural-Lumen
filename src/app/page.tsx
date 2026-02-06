"use client";

import { useEffect } from 'react';
import { Highway } from '@/components/simulation/Highway';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useSimulationStore } from '@/lib/store';
import { Activity } from 'lucide-react';

export default function Home() {
  const { metrics, tick } = useSimulationStore();

  // Run Simulation Loop (1Hz)
  useEffect(() => {
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <main className="flex h-screen w-screen chassis-bg text-slate-200 overflow-hidden selection:bg-cyan-500/30">
      
      {/* CENTER: Main Console Viewport */}
      <div className="flex-1 flex flex-col p-8 relative">
        
        {/* Top Status Rail */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
              <Activity className="text-cyan-400" size={28} />
              NEURAL-LUMEN 
              <span className="text-xs bg-slate-800/80 px-3 py-1 rounded text-slate-400 font-mono tracking-widest border border-slate-700/50">
                DIGITAL TWIN v1.0
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-2 font-mono tracking-wide">
              NHAI-44 // SECTOR 7 // CONNECTED // UPTIME: 99.8%
            </p>
          </div>

          {/* System Status Indicators */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded border border-slate-700/50">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-emerald-400 font-mono text-xs font-bold">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>

        {/* Center Stage: Highway Simulation */}
        <div className="flex-1 flex items-center justify-center relative">
          <Highway />
        </div>

        {/* Bottom Metrics Bar */}
        <div className="mt-6 grid grid-cols-2 gap-4 px-2">
          {/* Grid Load */}
          <div className="bg-[#25262b] border border-[#373a40] rounded-lg p-4 shadow-[4px_4px_10px_rgba(0,0,0,0.6)]">
            <div className="text-[10px] tracking-widest text-slate-500 uppercase font-bold mb-2">
              Grid Power Draw
            </div>
            <div className="font-mono text-3xl text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]">
              {metrics.powerDraw.toFixed(2)} <span className="text-lg text-slate-500">kW</span>
            </div>
            <div className="text-xs text-slate-600 mt-2">Baseline: 3.00 kW (Legacy System)</div>
          </div>

          {/* Carbon Credits */}
          <div className="bg-[#25262b] border border-[#373a40] rounded-lg p-4 shadow-[4px_4px_10px_rgba(0,0,0,0.6)]">
            <div className="text-[10px] tracking-widest text-slate-500 uppercase font-bold mb-2">
              Carbon Credits Earned
            </div>
            <div className="font-mono text-3xl text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
              {metrics.carbonCredits.toFixed(4)}
            </div>
            <div className="text-xs text-slate-600 mt-2">
              ≈ ₹{(metrics.carbonCredits * 1200).toFixed(2)} INR
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT: Control Deck */}
      <Sidebar />

    </main>
  );
}