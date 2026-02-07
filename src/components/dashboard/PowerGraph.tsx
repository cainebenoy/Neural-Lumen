'use client';

import { useSimulationStore } from '@/lib/store';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, Pause, Play } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

/**
 * PowerGraph - Real-time Power Consumption Telemetry
 * ECG-style scrolling area chart showing power draw over time
 * Baseline: 300 kW for 2000 poles at 150W each
 */

const BASELINE_POWER_KW = 300;
const MAX_CHART_POWER = 350; // Max Y axis value in kW

// Custom tooltip for cleaner data display - defined outside component
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; payload: { time: string } }[] }) => {
  if (active && payload && payload.length) {
    const currentPower = payload[0].value;
    const savings = BASELINE_POWER_KW - currentPower;
    const savingsPercent = ((savings / BASELINE_POWER_KW) * 100).toFixed(1);
    
    return (
      <div className="bg-black/90 border border-amber-500/50 rounded px-3 py-2 backdrop-blur-sm">
        <p className="text-xs text-amber-400 font-mono font-bold">
          {currentPower.toFixed(1)} kW
        </p>
        <p className="text-[10px] text-emerald-400 font-mono">
          Saving {savings.toFixed(1)} kW ({savingsPercent}%)
        </p>
        <p className="text-[9px] text-slate-500 font-mono">
          {payload[0].payload.time}
        </p>
      </div>
    );
  }
  return null;
};

export const PowerGraph = () => {
  const { powerHistory } = useSimulationStore();
  const [isPaused, setIsPaused] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Wait for container to mount and have dimensions before rendering chart
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  // Get latest reading for display
  const latestReading = powerHistory.length > 0 ? powerHistory[powerHistory.length - 1].value : 0;
  const savingsPercent = latestReading > 0 ? ((BASELINE_POWER_KW - latestReading) / BASELINE_POWER_KW * 100).toFixed(0) : 0;

  return (
    <div className="bg-slate-900/80 border-2 border-slate-700/50 rounded-lg p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.6)] h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
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
      <div className="flex-1 min-h-0">
        {isReady && powerHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                style={{ fontSize: '8px', fontFamily: 'monospace' }}
                tick={{ fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#334155', strokeWidth: 1 }}
                domain={[0, MAX_CHART_POWER]}
                ticks={[0, 100, 200, 300]}
                tickFormatter={(value) => `${value}`}
                width={35}
              />
              
              {/* Baseline Reference Line */}
              <ReferenceLine 
                y={BASELINE_POWER_KW} 
                stroke="#ef4444" 
                strokeDasharray="4 4" 
                strokeOpacity={0.6}
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
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500/60" style={{ borderTop: '2px dashed #ef4444' }} />
          <span className="text-[9px] text-slate-500 font-mono">
            Legacy Baseline: {BASELINE_POWER_KW} kW
          </span>
        </div>
        <span className="text-[9px] text-emerald-400 font-mono font-bold">
          {powerHistory.length > 0 ? `↓${savingsPercent}%` : '--'}
        </span>
      </div>
    </div>
  );
};
