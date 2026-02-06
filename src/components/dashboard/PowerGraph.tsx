'use client';

import { useSimulationStore } from '@/lib/store';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

/**
 * PowerGraph - Real-time Power Consumption Telemetry
 * ECG-style scrolling area chart showing power draw over time
 */

// Custom tooltip for cleaner data display - defined outside component
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-amber-500/50 rounded px-3 py-2 backdrop-blur-sm">
        <p className="text-xs text-amber-400 font-mono font-bold">
          {payload[0].value.toFixed(2)} kW
        </p>
        <p className="text-[10px] text-slate-500 font-mono">
          {payload[0].payload.time}
        </p>
      </div>
    );
  }
  return null;
};

export const PowerGraph = () => {
  const { powerHistory } = useSimulationStore();

  return (
    <div className="bg-slate-900/80 border-2 border-slate-700/50 rounded-lg p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.6)] h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-amber-400" />
          <h3 className="text-[10px] tracking-[0.3em] text-slate-400 uppercase font-bold font-mono">
            Live Telemetry
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" />
          <span className="text-[9px] text-amber-400 font-mono font-bold">STREAMING</span>
        </div>
      </div>

      {/* Graph */}
      <div className="h-[calc(100%-3rem)]">
        {powerHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={powerHistory}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              
              {/* Minimal X Axis - Time */}
              <XAxis
                dataKey="time"
                stroke="#475569"
                style={{ fontSize: '9px', fontFamily: 'monospace' }}
                tick={{ fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#334155', strokeWidth: 1 }}
                interval="preserveStartEnd"
                tickFormatter={(value) => {
                  // Show only seconds for cleaner look
                  const parts = value.split(':');
                  return parts.length === 3 ? `${parts[1]}:${parts[2]}` : value;
                }}
              />
              
              {/* Minimal Y Axis - Power (kW) */}
              <YAxis
                stroke="#475569"
                style={{ fontSize: '9px', fontFamily: 'monospace' }}
                tick={{ fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#334155', strokeWidth: 1 }}
                domain={[0, 3.5]}
                ticks={[0, 1, 2, 3]}
                tickFormatter={(value) => `${value}`}
              />
              
              {/* Tooltip */}
              <Tooltip content={<CustomTooltip />} />
              
              {/* Area Fill - Amber Gradient */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#powerGradient)"
                animationDuration={300}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Activity className="text-slate-600 mx-auto mb-2 animate-pulse" size={32} />
              <p className="text-xs text-slate-600 font-mono">
                Waiting for telemetry data...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Baseline Reference */}
      <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
        <span className="text-[9px] text-slate-500 font-mono">
          Baseline: 3.00 kW
        </span>
        <span className="text-[9px] text-emerald-400 font-mono">
          {powerHistory.length > 0 && powerHistory[powerHistory.length - 1] && (
            <>
              Current: {powerHistory[powerHistory.length - 1].value.toFixed(2)} kW
            </>
          )}
        </span>
      </div>
    </div>
  );
};
