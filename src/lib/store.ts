import { create } from 'zustand';

// Types
export type PoleMode = 'STANDARD' | 'FOG_AMBER' | 'ECO_DIM' | 'EMERGENCY_PULSE';
export type PoleStatus = 'ACTIVE' | 'CRASH' | 'WARNING';

export interface Pole {
  id: number;
  status: PoleStatus;
  mode: PoleMode;
  brightness: number; // 0-100
  windHarvest: number; // Watts
}

interface SimulationState {
  poles: Pole[];
  env: {
    fog: boolean;
    windSpeed: number;
    time: number; // 0-2400
  };
  metrics: {
    powerDraw: number;
    carbonCredits: number;
  };
  // Actions
  toggleFog: (active: boolean) => void;
  triggerCrash: (poleId: number) => void;
  setWind: (speed: number) => void;
  setTime: (time: number) => void;
  tick: () => void; // Simulation loop
  reset: () => void;
}

// Helper to init highway
const generatePoles = (count: 20) => 
  Array.from({ length: count }, (_, i) => ({
    id: i,
    status: 'ACTIVE' as PoleStatus,
    mode: 'STANDARD' as PoleMode,
    brightness: 80,
    windHarvest: 0,
  }));

export const useSimulationStore = create<SimulationState>((set, get) => ({
  poles: generatePoles(20),
  env: { fog: false, windSpeed: 10, time: 2000 },
  metrics: { powerDraw: 2.4, carbonCredits: 0 },

  toggleFog: (active) => set((state) => ({
    env: { ...state.env, fog: active },
    poles: state.poles.map(p => ({
      ...p,
      mode: active ? 'FOG_AMBER' : 'STANDARD',
      brightness: active ? 100 : 80,
      // Reset status if turning off fog, unless crashed
      status: p.status === 'CRASH' ? 'CRASH' : 'ACTIVE'
    }))
  })),

  triggerCrash: (poleId) => set((state) => {
    const newPoles = [...state.poles];
    // 1. Crash the target
    newPoles[poleId].status = 'CRASH';
    
    // 2. Linear Mesh Logic: Warn 5 upstream poles
    // In a real road, upstream is lower index numbers (traffic flows L->R)
    for (let i = 1; i <= 5; i++) {
      const neighbor = poleId - i;
      if (neighbor >= 0 && newPoles[neighbor].status !== 'CRASH') {
        newPoles[neighbor].status = 'WARNING';
        newPoles[neighbor].mode = 'EMERGENCY_PULSE';
      }
    }
    return { poles: newPoles };
  }),

  setWind: (speed) => set((state) => ({
    env: { ...state.env, windSpeed: speed }
  })),

  setTime: (time) => set((state) => {
    // ECO Logic: If 1AM - 4AM, dim lights
    const isGhostHour = time >= 100 && time <= 400;
    const isDaytime = time >= 600 && time <= 1800;

    const newPoles = state.poles.map(p => {
      if (p.status === 'CRASH' || p.status === 'WARNING') return p; // Safety overrides Eco
      if (isDaytime) return { ...p, brightness: 0, mode: 'STANDARD' as PoleMode };
      if (isGhostHour) return { ...p, brightness: 30, mode: 'ECO_DIM' as PoleMode };
      return { ...p, brightness: state.env.fog ? 100 : 80, mode: state.env.fog ? 'FOG_AMBER' : 'STANDARD' as PoleMode };
    });

    return { 
      env: { ...state.env, time },
      poles: newPoles
    };
  }),

  tick: () => set((state) => {
    // Financial Math
    const totalWatts = state.poles.reduce((acc, p) => acc + (p.brightness * 1.5), 0); // 1.5W per 1% brightness
    const baselineWatts = 20 * 100 * 1.5; // Legacy system always 100%
    const savings = Math.max(0, baselineWatts - totalWatts);
    
    // Add realistic randomness to wind harvest
    const harvest = state.env.windSpeed * 0.5 * (0.8 + Math.random() * 0.4);

    return {
      metrics: {
        powerDraw: Number((totalWatts / 1000).toFixed(2)), // kW
        carbonCredits: state.metrics.carbonCredits + (savings * 0.0001) // Accumulate
      },
      poles: state.poles.map(p => ({...p, windHarvest: harvest}))
    };
  }),

  reset: () => set({
    poles: generatePoles(20),
    env: { fog: false, windSpeed: 10, time: 2000 },
    metrics: { powerDraw: 2.4, carbonCredits: 0 }
  })
}));