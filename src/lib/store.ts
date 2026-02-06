import { create } from 'zustand';

/**
 * Neural-Lumen Digital Twin Store
 * Smart Highway Lighting Simulation with Industrial Cyberpunk Aesthetic
 */

// TypeScript Interfaces
export type PoleMode = 'STANDARD' | 'FOG_AMBER' | 'ECO_DIM' | 'EMERGENCY_PULSE';
export type PoleStatus = 'ACTIVE' | 'CRASH' | 'WARNING';

export interface Pole {
  id: number;
  status: PoleStatus;
  mode: PoleMode;
  brightness: number; // 0-100
  windHarvest: number; // Watts harvested per pole
}

export interface PowerHistoryPoint {
  time: string;
  value: number;
}

export interface Vehicle {
  id: number;
  x_pos: number; // Position along highway (0-100%)
  speed: number; // km/h
  lane: number; // 1 or 2
}

interface SimulationState {
  poles: Pole[];
  vehicles: Vehicle[]; // Traffic physics simulation
  env: {
    fog: boolean;
    windSpeed: number; // km/h
    time: number; // 24-hour format (0-2400)
  };
  metrics: {
    powerDraw: number; // kW
    carbonCredits: number; // Accumulated credits
  };
  powerHistory: PowerHistoryPoint[]; // Real-time telemetry (max 50 points)
  // Actions
  toggleFog: () => void;
  triggerCrash: (id: number) => void;
  setWind: (speed: number) => void;
  setTime: (time: number) => void;
  tick: () => void;
  reset: () => void;
  spawnVehicle: () => void;
}

// Initialize 20 poles for the highway
const generatePoles = (count: number): Pole[] => 
  Array.from({ length: count }, (_, i) => ({
    id: i,
    status: 'ACTIVE' as PoleStatus,
    mode: 'STANDARD' as PoleMode,
    brightness: 80,
    windHarvest: 0,
  }));

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial State with 20 poles
  poles: generatePoles(20),
  vehicles: [], // Traffic simulation starts empty
  env: { fog: false, windSpeed: 10, time: 2000 },
  metrics: { powerDraw: 2.4, carbonCredits: 0 },
  powerHistory: [], // Start with empty history

  /**
   * FOG MODE: Switches all poles to 'FOG_AMBER' mode
   * White (Standard) → Amber (Fog)
   */
  toggleFog: () => set((state) => {
    const newFogState = !state.env.fog;
    return {
      env: { ...state.env, fog: newFogState },
      poles: state.poles.map(p => {
        // Don't override crash or warning states
        if (p.status === 'CRASH' || p.status === 'WARNING') return p;
        
        return {
          ...p,
          mode: newFogState ? 'FOG_AMBER' : 'STANDARD',
          brightness: newFogState ? 100 : 80,
        };
      })
    };
  }),

  /**
   * CRASH MODE: Triggers emergency pulse on 5 upstream poles
   * Sets target pole to 'CRASH' and poles (id-1 to id-5) to 'EMERGENCY_PULSE'
   */
  triggerCrash: (id: number) => set((state) => {
    const newPoles = [...state.poles];
    
    // 1. Set the crashed pole
    if (newPoles[id]) {
      newPoles[id] = {
        ...newPoles[id],
        status: 'CRASH',
        brightness: 0,
      };
    }
    
    // 2. Trigger pulse warning on 5 upstream poles (id-1 to id-5)
    for (let i = 1; i <= 5; i++) {
      const upstreamIndex = id - i;
      if (upstreamIndex >= 0 && newPoles[upstreamIndex]) {
        // Only warn if not already crashed
        if (newPoles[upstreamIndex].status !== 'CRASH') {
          newPoles[upstreamIndex] = {
            ...newPoles[upstreamIndex],
            status: 'WARNING',
            mode: 'EMERGENCY_PULSE',
            brightness: 100, // Full brightness for safety
          };
        }
      }
    }
    
    return { poles: newPoles };
  }),

  setWind: (speed: number) => set((state) => ({
    env: { ...state.env, windSpeed: speed }
  })),

  /**
   * ECO MODE: Dims lights to 30% during 1 AM - 4 AM
   * Time format: 0100-0400 (1 AM - 4 AM)
   */
  setTime: (time: number) => set((state) => {
    const isEcoHours = time >= 100 && time <= 400;

    const newPoles = state.poles.map(p => {
      // Safety modes override eco mode
      if (p.status === 'CRASH' || p.status === 'WARNING') return p;
      
      // ECO MODE: 1 AM - 4 AM
      if (isEcoHours) {
        return {
          ...p,
          mode: 'ECO_DIM' as PoleMode,
          brightness: 30,
        };
      }
      
      // Otherwise, respect fog mode or return to standard
      return {
        ...p,
        mode: (state.env.fog ? 'FOG_AMBER' : 'STANDARD') as PoleMode,
        brightness: state.env.fog ? 100 : 80,
      };
    });

    return { 
      env: { ...state.env, time },
      poles: newPoles
    };
  }),

  /**
   * TICK: Simulation loop
   * - Updates wind harvest based on wind speed
   * - Calculates carbon credits based on energy savings vs baseline
   * - Tracks power history for real-time telemetry graph
   * - Updates vehicle physics and radar detection
   */
  tick: () => set((state) => {
    // Calculate power consumption
    const WATTS_PER_PERCENT = 1.5; // 1.5W per 1% brightness
    const totalWatts = state.poles.reduce((acc, p) => {
      return acc + (p.brightness * WATTS_PER_PERCENT);
    }, 0);
    
    // Baseline: Legacy system always 100% brightness on all 20 poles
    const baselineWatts = 20 * 100 * WATTS_PER_PERCENT;
    const savings = Math.max(0, baselineWatts - totalWatts);
    
    // Wind harvest calculation with realistic variance
    const harvestPerPole = state.env.windSpeed * 0.5 * (0.8 + Math.random() * 0.4);

    const newPowerDraw = Number((totalWatts / 1000).toFixed(2));

    // Update power history (ECG-style scrolling data)
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    const newHistoryPoint: PowerHistoryPoint = {
      time: timeString,
      value: newPowerDraw,
    };

    // Keep only last 50 data points for performance
    const updatedHistory = [...state.powerHistory, newHistoryPoint];
    if (updatedHistory.length > 50) {
      updatedHistory.shift(); // Remove oldest entry
    }

    // VEHICLE PHYSICS ENGINE
    // Move vehicles forward based on speed (assuming 1 second tick)
    const updatedVehicles = state.vehicles
      .map(vehicle => ({
        ...vehicle,
        x_pos: vehicle.x_pos + (vehicle.speed / 3600), // Convert km/h to % per second (approx 2km road)
      }))
      .filter(vehicle => vehicle.x_pos <= 105); // Remove vehicles that drove off-screen

    // RADAR DETECTION LOGIC
    // Each pole covers 5% of the highway (20 poles = 100%)
    const updatedPoles = state.poles.map((pole, index) => {
      // Don't override crash or warning states
      if (pole.status === 'CRASH' || pole.status === 'WARNING') return pole;

      const polePosition = (index / 19) * 100; // 0% to 100%
      const detectionRange = 10; // ±10% detection zone

      // Check if any vehicle is near this pole
      const vehicleDetected = updatedVehicles.some(
        vehicle => Math.abs(vehicle.x_pos - polePosition) < detectionRange
      );

      // PREDICTIVE LIGHTING: Boost brightness when vehicle detected
      if (vehicleDetected) {
        return {
          ...pole,
          brightness: 100, // Full brightness for safety
        };
      }

      // Fade back to standard brightness based on mode
      let standardBrightness = 80;
      if (pole.mode === 'FOG_AMBER') standardBrightness = 100;
      if (pole.mode === 'ECO_DIM') standardBrightness = 30;

      return {
        ...pole,
        brightness: pole.brightness > standardBrightness 
          ? Math.max(standardBrightness, pole.brightness - 10) // Gradual fade
          : standardBrightness,
      };
    });

    return {
      metrics: {
        powerDraw: newPowerDraw,
        carbonCredits: state.metrics.carbonCredits + (savings * 0.0001), // Accumulate credits
      },
      poles: updatedPoles.map(p => ({
        ...p,
        windHarvest: Number(harvestPerPole.toFixed(2)),
      })),
      powerHistory: updatedHistory,
      vehicles: updatedVehicles,
    };
  }),

  /**
   * SPAWN VEHICLE: Creates a new vehicle at the start of the highway
   */
  spawnVehicle: () => set((state) => {
    const newVehicle: Vehicle = {
      id: Date.now() + Math.random(), // Unique ID
      x_pos: 0, // Start at beginning
      speed: 60 + Math.random() * 60, // Random speed 60-120 km/h
      lane: Math.random() > 0.5 ? 1 : 2, // Random lane
    };

    return {
      vehicles: [...state.vehicles, newVehicle],
    };
  }),

  reset: () => set({
    poles: generatePoles(20),
    vehicles: [], // Clear traffic
    env: { fog: false, windSpeed: 10, time: 2000 },
    metrics: { powerDraw: 2.4, carbonCredits: 0 },
    powerHistory: [], // Clear history on reset
  })
}));