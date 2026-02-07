'use client';

import { useSimulationStore } from '@/lib/store';
import { Leaf, TrendingDown, Zap, Battery, Wind, Heart, ShieldCheck, Ban, Trees } from 'lucide-react';

// Baseline for 2000 poles at 150W each = 300kW
const BASELINE_POWER_KW = 300;
const CARBON_CREDIT_PRICE_INR = 1200;

export const Analytics = () => {
  const metrics = useSimulationStore((state) => state.metrics);
  const poles = useSimulationStore((state) => state.poles);
  
  // Calculate real savings percentage based on actual baseline
  const savingsPercent = BASELINE_POWER_KW > 0 
    ? Math.max(0, Math.round(((BASELINE_POWER_KW - metrics.powerDraw) / BASELINE_POWER_KW) * 100))
    : 0;

  // Calculate average pole brightness
  const avgBrightness = poles.length > 0 
    ? Math.round(poles.reduce((acc, p) => acc + p.brightness, 0) / poles.length)
    : 0;


  return (
    <div className="space-y-3">
      {/* Carbon Credits Card */}
      <div className="bg-[#25262b] p-3 rounded-lg border border-[#373a40] shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Leaf className="text-emerald-500" size={14} />
            <span className="text-[9px] tracking-widest text-slate-400 uppercase font-bold">
              Carbon Credits
            </span>
          </div>
          <span className="text-[9px] text-emerald-600 font-mono">+{(savingsPercent * 0.01).toFixed(2)}/s</span>
        </div>
        <div className="font-mono text-xl text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
          {metrics.carbonCredits.toFixed(4)}
        </div>
        <div className="text-[10px] text-slate-500 mt-1.5 flex justify-between">
          <span>≈ ₹{(metrics.carbonCredits * CARBON_CREDIT_PRICE_INR).toFixed(0)}</span>
          <span className="text-emerald-600">CO₂ offset</span>
        </div>
      </div>

      {/* Energy Savings Card */}
      <div className="bg-[#25262b] p-3 rounded-lg border border-[#373a40] shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="text-cyan-400" size={14} />
            <span className="text-[9px] tracking-widest text-slate-400 uppercase font-bold">
              Power Savings
            </span>
          </div>
        </div>
        <div className="font-mono text-xl text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
          {savingsPercent}%
        </div>
        <div className="text-[10px] text-slate-500 mt-1.5">
          <div className="flex justify-between">
            <span>Legacy: {BASELINE_POWER_KW} kW</span>
            <span className="text-cyan-500">Now: {metrics.powerDraw.toFixed(1)} kW</span>
          </div>
        </div>
        {/* Mini power bar */}
        <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${100 - savingsPercent}%` }}
          />
        </div>
      </div>

      {/* Avg Brightness Card */}
      <div className="bg-[#25262b] p-3 rounded-lg border border-[#373a40] shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="text-amber-400" size={14} />
          <span className="text-[9px] tracking-widest text-slate-400 uppercase font-bold">
            Avg Brightness
          </span>
        </div>
        <div className="flex items-end gap-2">
          <span className="font-mono text-xl text-amber-400">{avgBrightness}%</span>
          <span className="text-[10px] text-slate-500 pb-0.5">across {poles.length} poles</span>
        </div>
        {/* Brightness bar */}
        <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
            style={{ width: `${avgBrightness}%` }}
          />
        </div>
      </div>

      {/* Wind Turbine Output Card */}
      <div className="bg-[#25262b] p-3 rounded-lg border border-[#373a40] shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wind className="text-sky-400" size={14} />
            <span className="text-[9px] tracking-widest text-slate-400 uppercase font-bold">
              Turbine Output
            </span>
          </div>
          <span className="text-[9px] text-sky-600 font-mono">renewable</span>
        </div>
        <div className="font-mono text-xl text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
          {metrics.turbineOutput.toFixed(1)} kW
        </div>
        <div className="text-[10px] text-slate-500 mt-1.5">
          <div className="flex justify-between">
            <span>Consumption: {metrics.powerDraw.toFixed(1)} kW</span>
            <span className="text-emerald-500">Net: {metrics.netGridDraw.toFixed(1)} kW</span>
          </div>
        </div>
        {/* Offset bar shows how much consumption is offset by wind */}
        <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-sky-600 to-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100, metrics.powerDraw > 0 ? (metrics.turbineOutput / metrics.powerDraw) * 100 : 0)}%` }}
          />
        </div>
        <div className="text-[9px] text-slate-600 mt-1 text-center">
          {metrics.powerDraw > 0 ? Math.min(100, (metrics.turbineOutput / metrics.powerDraw * 100)).toFixed(0) : 0}% renewable offset
        </div>
      </div>

      {/* Safety Metrics Section Header */}
      <div className="pt-2 border-t border-slate-700/50">
        <div className="text-[9px] tracking-widest text-slate-500 uppercase font-bold mb-3 text-center">
          Safety Impact
        </div>
      </div>

      {/* Lives Saved Card (Golden Hour Protocol) */}
      <div className="bg-[#25262b] p-3 rounded-lg border border-blue-900/50 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Heart className="text-blue-400" size={14} />
            <span className="text-[9px] tracking-widest text-slate-400 uppercase font-bold">
              Lives Saved
            </span>
          </div>
          <span className="text-[8px] text-blue-500 font-mono bg-blue-900/30 px-1.5 py-0.5 rounded">GOLDEN HOUR</span>
        </div>
        <div className="font-mono text-xl text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]">
          {Math.floor(metrics.livesSaved)}
        </div>
        <div className="text-[10px] text-slate-500 mt-1.5">
          Emergency corridor activations
        </div>
      </div>

      {/* Accidents Prevented Card (Phantom Shield) */}
      <div className="bg-[#25262b] p-3 rounded-lg border border-amber-900/50 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-amber-400" size={14} />
            <span className="text-[9px] tracking-widest text-slate-400 uppercase font-bold">
              Accidents Prevented
            </span>
          </div>
          <span className="text-[8px] text-amber-500 font-mono bg-amber-900/30 px-1.5 py-0.5 rounded">PHANTOM SHIELD</span>
        </div>
        <div className="font-mono text-xl text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
          {Math.floor(metrics.accidentsPrevented)}
        </div>
        <div className="text-[10px] text-slate-500 mt-1.5">
          Ghost truck hazards neutralized
        </div>
      </div>

      {/* Intercepts Count Card (Neural Intercept) */}
      <div className="bg-[#25262b] p-3 rounded-lg border border-red-900/50 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Ban className="text-red-400" size={14} />
            <span className="text-[9px] tracking-widest text-slate-400 uppercase font-bold">
              Wrong-Way Stops
            </span>
          </div>
          <span className="text-[8px] text-red-500 font-mono bg-red-900/30 px-1.5 py-0.5 rounded">NEURAL INTERCEPT</span>
        </div>
        <div className="font-mono text-xl text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]">
          {metrics.interceptsCount}
        </div>
        <div className="text-[10px] text-slate-500 mt-1.5">
          Wrong-way drivers intercepted
        </div>
      </div>

      {/* Wildlife Saved Card (Bio-Shield) */}
      <div className="bg-[#25262b] p-3 rounded-lg border border-emerald-900/50 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trees className="text-emerald-400" size={14} />
            <span className="text-[9px] tracking-widest text-slate-400 uppercase font-bold">
              Wildlife Protected
            </span>
          </div>
          <span className="text-[8px] text-emerald-500 font-mono bg-emerald-900/30 px-1.5 py-0.5 rounded">BIO-SHIELD</span>
        </div>
        <div className="font-mono text-xl text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
          {metrics.wildlifeSaved}
        </div>
        <div className="text-[10px] text-slate-500 mt-1.5">
          Safe wildlife crossings
        </div>
      </div>
    </div>
  );
};
