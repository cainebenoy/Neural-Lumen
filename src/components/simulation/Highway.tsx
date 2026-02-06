import { useSimulationStore } from '@/lib/store';
import { Pole } from './Pole';

export const Highway = () => {
  const { poles, triggerCrash } = useSimulationStore();

  return (
    <div className="relative w-full max-w-4xl h-96 border-8 border-[#141517] rounded-xl bg-gradient-to-b from-slate-900 to-black overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.9),inset_0_0_50px_black]">
      {/* 0. Reflection Overlay (Glass Effect) */}
      <div className="absolute inset-0 z-50 pointer-events-none bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-20 rounded-lg" />

      {/* 1. Sky/Atmosphere Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800/30 to-transparent" />

      {/* 2. The Road Surface */}
      <div className="absolute bottom-0 w-full h-40 bg-gradient-to-b from-slate-900 to-black border-t-4 border-slate-700/50">
        {/* Asphalt Texture */}
        <div className="absolute inset-0 opacity-20 asphalt-texture" />
        
        {/* Lane Markers */}
        <div className="absolute top-1/3 w-full h-0.5 border-t border-dashed border-white/20"></div>
        <div className="absolute top-2/3 w-full h-0.5 border-t border-dashed border-white/20"></div>
      </div>

      {/* 3. Pole Array */}
      <div className="absolute bottom-40 w-full px-8 h-32 flex justify-between items-end transition-all duration-500">
        {poles.map((pole) => (
          <div key={pole.id} onClick={() => triggerCrash(pole.id)} className="cursor-pointer hover:opacity-80 transition-opacity">
            <Pole data={pole} />
          </div>
        ))}
      </div>

      {/* 4. Fog Overlay Layer */}
      {poles[0]?.mode === 'FOG_AMBER' && (
        <div className="absolute inset-0 z-30 pointer-events-none opacity-0 animate-pulse bg-slate-400/5 backdrop-blur-sm transition-opacity duration-1000" />
      )}

      {/* 5. Status Indicator */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] text-slate-400 font-mono">LIVE</span>
      </div>
    </div>
  );
};