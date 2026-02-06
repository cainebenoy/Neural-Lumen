import { useSimulationStore } from '@/lib/store';
import { Pole } from './Pole';

export const Highway = () => {
  const { poles, triggerCrash } = useSimulationStore();

  return (
    <div className="relative w-full max-w-6xl h-[500px] border-8 border-[#0a0a0a] rounded-2xl bg-gradient-to-b from-slate-800 to-black overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9),inset_0_0_80px_rgba(0,0,0,0.95)]">
      
      {/* Glass Monitor Reflection */}
      <div className="absolute inset-0 z-50 pointer-events-none bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-30 rounded-xl" />

      {/* Sky/Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-700/20 via-slate-900/40 to-black" />

      {/* Stars/Ambient Light */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-white rounded-full animate-pulse" />
        <div className="absolute top-[15%] right-[25%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-[20%] left-[50%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* The Road Surface */}
      <div className="absolute bottom-0 w-full h-48 bg-gradient-to-b from-slate-900 via-slate-950 to-black border-t-[6px] border-slate-600/30">
        
        {/* Asphalt Texture */}
        <div className="absolute inset-0 opacity-40 asphalt-texture" />
        
        {/* Center Lane Divider */}
        <div className="absolute top-1/2 left-0 right-0 h-1 flex justify-around items-center">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="w-12 h-1 bg-yellow-500/40" />
          ))}
        </div>
        
        {/* Road Edges */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/20" />
        <div className="absolute bottom-4 left-0 right-0 h-0.5 bg-white/20" />
      </div>

      {/* Pole Array - THE MAIN ATTRACTION */}
      <div className="absolute bottom-48 left-0 right-0 h-40 px-8 flex justify-between items-end">
        {poles.map((pole) => (
          <div 
            key={pole.id} 
            onClick={() => triggerCrash(pole.id)} 
            className="cursor-pointer hover:scale-110 transition-transform duration-200"
            title={`Pole #${pole.id} - Click to simulate crash`}
          >
            <Pole data={pole} />
          </div>
        ))}
      </div>

      {/* Dense Fog Overlay */}
      {poles[0]?.mode === 'FOG_AMBER' && (
        <div className="absolute inset-0 z-40 pointer-events-none bg-gradient-to-b from-slate-400/20 via-slate-500/10 to-transparent backdrop-blur-[2px] animate-pulse" />
      )}

      {/* System Status Overlay */}
      <div className="absolute top-4 left-4 z-40 flex flex-col gap-2">
        <div className="bg-black/60 border border-slate-700/50 rounded px-3 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] text-slate-400 font-mono">
            VIEWPORT: HIGHWAY NH-44 KM 120-122
          </span>
        </div>
        <div className="bg-black/60 border border-emerald-700/50 rounded px-3 py-1.5 backdrop-blur-sm flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-mono font-bold">SIMULATION ACTIVE</span>
        </div>
      </div>

      {/* Click Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="bg-black/80 border border-cyan-700/50 rounded-lg px-4 py-2 backdrop-blur-sm">
          <p className="text-xs text-cyan-400 font-mono text-center">
            ▲ CLICK ANY POLE TO SIMULATE CRASH EVENT ▲
          </p>
        </div>
      </div>
    </div>
  );
};