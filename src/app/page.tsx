"use client";

import { useEffect } from 'react';
import { Highway } from '@/components/simulation/Highway';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Analytics } from '@/components/dashboard/Analytics';
import { useSimulationStore } from '@/lib/store';
import { Zap, Leaf } from 'lucide-react';

export default function Home() {
  const { metrics, tick } = useSimulationStore();

  // Run Simulation Loop (1Hz)
  // This drives the carbon credits counter and wind turbine animation updates
  useEffect(() => {
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [tick]);

  return (
    <main className="flex h-screen w-screen bg-[#141517] text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* LEFT: Main Viewport (The "Glass" Window) */}
      <div className="flex-1 flex flex-col p-6 relative">
        
        {/* Top Status Rail */}
        <header className="flex justify-between items-start mb-6 pl-2 gap-6">
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
              NEURAL-LUMEN <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono tracking-widest border border-slate-700">DIGITAL TWIN v1.0</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-mono tracking-tight">NHAI-44 // SECTOR 7 // CONNECTED</p>
          </div>

          {/* HUD Stats (The "Money" Shot) */}
          <div className="flex gap-4">
            {/* Grid Load Module */}
            <div className="bg-black/40 border border-slate-800 p-3 rounded flex items-center gap-3 min-w-[160px] shadow-lg backdrop-blur-sm">
              <div className="p-2 bg-amber-500/10 rounded-full border border-amber-500/20">
                <Zap className="text-amber-400" size={18} />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Grid Load</div>
                <div className="text-lg font-mono text-slate-200 leading-none mt-1">
                  {metrics.powerDraw} <span className="text-xs text-slate-500">kW</span>
                </div>
              </div>
            </div>

            {/* Carbon Credits Module */}
             <div className="bg-black/40 border border-slate-800 p-3 rounded flex items-center gap-3 min-w-[180px] shadow-lg backdrop-blur-sm">
              <div className="p-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <Leaf className="text-emerald-400" size={18} />
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Carbon Credits</div>
                <div className="text-lg font-mono text-emerald-400 leading-none mt-1">
                  {metrics.carbonCredits.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content: Highway + Instructions */}
        <div className="flex-1 flex items-center justify-between gap-6 relative">
          {/* LEFT: Highway Viewport */}
          <div className="flex-1 flex items-center justify-center h-full">
            <Highway />
          </div>

          {/* RIGHT: Analytics Panel */}
          <div className="w-72 h-full flex flex-col bg-[#1a1b1e] border border-[#2c2e33] rounded-lg p-4 shadow-2xl overflow-y-auto">
            <h3 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase mb-4 pb-4 border-b border-[#2c2e33]">
              Analytics
            </h3>
            <Analytics />
            
            {/* Instructions */}
            <div className="mt-6 pt-6 border-t border-[#2c2e33]">
              <p className="text-[10px] text-slate-500 font-mono mb-3">SYSTEM INSTRUCTIONS:</p>
              <ul className="text-[9px] text-slate-600 space-y-2 font-mono">
                <li>• Click poles to trigger crash</li>
                <li>• Toggle FOG for spectrum shift</li>
                <li>• Drag CLOCK to 03:00 for eco</li>
                <li>• Adjust WIND speed for turbines</li>
                <li>• Watch carbon credits tick</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT: Control Deck */}
      <Sidebar />

    </main>
  );
}