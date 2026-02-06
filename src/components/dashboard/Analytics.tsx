import { useSimulationStore } from '@/lib/store';
import { Leaf, TrendingDown } from 'lucide-react';

export const Analytics = () => {
  const { metrics } = useSimulationStore();
  
  // Calculate savings percentage
  const savingsPercent = metrics.powerDraw > 0 
    ? Math.round(((3.0 - metrics.powerDraw) / 3.0) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Carbon Credits Card */}
      <div className="bg-[#25262b] p-4 rounded-lg border border-[#373a40] shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Leaf className="text-emerald-500" size={16} />
            <span className="text-[10px] tracking-widest text-slate-400 uppercase font-bold">
              Carbon Credits Earned
            </span>
          </div>
        </div>
        <div className="font-mono text-2xl text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
          {metrics.carbonCredits.toFixed(2)}
        </div>
        <div className="text-xs text-slate-500 mt-2">
          {(metrics.carbonCredits * 1200).toFixed(0)} ₹
        </div>
      </div>

      {/* Energy Savings Card */}
      <div className="bg-[#25262b] p-4 rounded-lg border border-[#373a40] shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="text-cyan-400" size={16} />
            <span className="text-[10px] tracking-widest text-slate-400 uppercase font-bold">
              Power Saved vs Baseline
            </span>
          </div>
        </div>
        <div className="font-mono text-2xl text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
          {savingsPercent}%
        </div>
        <div className="text-xs text-slate-500 mt-2">
          Baseline: 3.0 kW | Current: {metrics.powerDraw.toFixed(2)} kW
        </div>
      </div>
    </div>
  );
};
