import { create } from 'zustand';

/**
 * Neural-Lumen Digital Twin Store
 * Smart Highway Lighting Simulation with Industrial Cyberpunk Aesthetic
 */

// TypeScript Interfaces
export type PoleMode = 'STANDARD' | 'FOG_AMBER' | 'ECO_DIM' | 'EMERGENCY_PULSE' | 'BATTERY';
export type PoleStatus = 'ACTIVE' | 'CRASH' | 'WARNING';
export type WeatherType = 'CLEAR' | 'RAIN' | 'SNOW';

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

export type VehicleType = 'car' | 'truck';

export interface Vehicle {
  id: number;
  x_pos: number; // Position along highway (0-100%)
  speed: number; // km/h
  lane: number; // 1 or 2
  type: VehicleType; // Car (light, fast) or Truck (heavy, slow)
}

interface SimulationState {
  poles: Pole[];
  vehicles: Vehicle[]; // Traffic physics simulation
  env: {
    fog: boolean;
    windSpeed: number; // km/h
    time: number; // 24-hour format (0-2400)
    weather: WeatherType; // CLEAR, RAIN, or SNOW
    visibility: number; // 0-100% visibility (100 = clear, 0 = zero visibility)
  };
  metrics: {
    powerDraw: number; // kW
    carbonCredits: number; // Accumulated credits
  };
  powerHistory: PowerHistoryPoint[]; // Real-time telemetry (max 50 points)
  autoTraffic: boolean; // Auto-spawn vehicles
  gridFailure: boolean; // Grid failure mode (battery backup)
  _tickCount: number; // Internal tick counter for throttling (not displayed)
  // Actions
  toggleFog: () => void;
  triggerCrash: (id: number) => void;
  setWind: (speed: number) => void;
  setTime: (time: number) => void;
  setWeather: (weather: WeatherType) => void;
  tick: () => void;
  reset: () => void;
  spawnVehicle: (forceType?: VehicleType) => void;
  spawnTrafficJam: () => void;
  toggleAutoTraffic: () => void;
  triggerGridFailure: () => void;
}

// Initialize 20 poles for the highway
const generatePoles = (count: number): Pole[] => 
  Array.from({ length: count }, (_, i) => ({
    id: i,
    status: 'ACTIVE' as PoleStatus,
    mode: 'STANDARD' as PoleMode,
    brightness: 40,
    windHarvest: 0,
  }));

/**
 * Calculate visibility percentage based on environmental conditions
 * Factors: fog presence, weather type, wind speed
 * Wind > 15 helps disperse fog (+10-15%), but in rain wind > 20 kicks up spray (-5%)
 */
const calculateVisibility = (fog: boolean, weather: WeatherType, windSpeed: number): number => {
  let vis = 100;

  // Base weather impact
  if (weather === 'SNOW') vis -= 55;      // Snow: heavy visibility reduction
  else if (weather === 'RAIN') vis -= 35;  // Rain: moderate reduction

  // Fog layer (independent or compounding with weather)
  if (fog && weather === 'CLEAR') vis -= 45; // Fog alone: 55% visibility
  else if (fog) vis -= 15;                   // Fog + weather: compounds

  // Wind effects on visibility
  if (fog && windSpeed > 15) {
    // High wind helps disperse fog
    vis += Math.min(15, (windSpeed - 15) * 1.5);
  }
  if (weather === 'RAIN' && windSpeed > 20) {
    // Very high wind in rain = spray reducing visibility further
    vis -= Math.min(10, (windSpeed - 20) * 1);
  }
  if (weather === 'SNOW' && windSpeed > 10) {
    // Wind-blown snow (whiteout conditions)
    vis -= Math.min(15, (windSpeed - 10) * 0.75);
  }

  return Math.max(5, Math.min(100, Math.round(vis))); // Clamp 5-100%
};

/**
 * Get maximum safe vehicle speed for current weather conditions
 * Returns a speed multiplier (0.0 - 1.0)
 */
const getWeatherSpeedMultiplier = (weather: WeatherType, fog: boolean): number => {
  if (weather === 'SNOW') return 0.45;  // Max ~55 km/h for cars, ~32 km/h for trucks
  if (weather === 'RAIN') return 0.65;  // Max ~78 km/h for cars, ~45 km/h for trucks
  if (fog) return 0.7;                  // Fog alone: ~84 km/h for cars
  return 1.0;                           // Clear: no cap
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial State with 20 poles
  poles: generatePoles(20),
  vehicles: [], // Traffic simulation starts empty
  env: { fog: false, windSpeed: 10, time: 2000, weather: 'CLEAR', visibility: 100 },
  metrics: { powerDraw: 2.4, carbonCredits: 0 },
  powerHistory: [], // Start with empty history
  autoTraffic: false, // Auto-spawn disabled by default
  gridFailure: false, // Grid is operational
  _tickCount: 0,

  /**
   * FOG MODE: Switches all poles to 'FOG_AMBER' mode
   * White (Standard) → Amber (Fog)
   * Syncs with weather state — toggling fog off during RAIN/SNOW resets weather to CLEAR
   * Calculates visibility based on fog + weather + wind conditions
   */
  toggleFog: () => set((state) => {
    const newFogState = !state.env.fog;
    
    // If turning fog off while weather requires it, reset weather to CLEAR
    const newWeather = (!newFogState && (state.env.weather === 'RAIN' || state.env.weather === 'SNOW'))
      ? 'CLEAR' as WeatherType
      : state.env.weather;
    
    // Calculate visibility: fog alone = 40%, weather compounds it further
    const visibility = calculateVisibility(newFogState, newWeather, state.env.windSpeed);
    
    return {
      env: { ...state.env, fog: newFogState, weather: newWeather, visibility },
      poles: state.poles.map(p => {
        // Don't override crash or warning states
        if (p.status === 'CRASH' || p.status === 'WARNING') return p;
        
        // Grid failure takes priority over fog
        if (state.gridFailure) {
          return { ...p, mode: 'BATTERY' as PoleMode, brightness: 25 };
        }
        
        if (newFogState) {
          // Brightness scales with how poor visibility is — worse visibility = brighter lights
          const fogBrightness = newWeather === 'SNOW' ? 100 : newWeather === 'RAIN' ? 90 : 80;
          return { ...p, mode: 'FOG_AMBER' as PoleMode, brightness: fogBrightness };
        }
        
        // Turning fog off: respect time-of-day modes
        const isDaytime = state.env.time >= 600 && state.env.time <= 1800;
        if (isDaytime) {
          return { ...p, mode: 'STANDARD' as PoleMode, brightness: 0 };
        }
        const isEcoHours = state.env.time >= 100 && state.env.time <= 400;
        if (isEcoHours) {
          return { ...p, mode: 'ECO_DIM' as PoleMode, brightness: 30 };
        }
        return { ...p, mode: 'STANDARD' as PoleMode, brightness: 40 };
      })
    };
  }),

  /**
   * CRASH MODE: Triggers emergency pulse on 5 upstream poles
   * Sets target pole to 'CRASH' with STAGGERED RIPPLE propagation
   * PRD: Pole N-1 reacts in 150ms, N-2 in 300ms... N-5 in 750ms
   */
  triggerCrash: (id: number) => {
    // 1. Immediately set the crashed pole
    set((state) => {
      const newPoles = [...state.poles];
      if (newPoles[id]) {
        newPoles[id] = {
          ...newPoles[id],
          status: 'CRASH',
          brightness: 0,
        };
      }
      return { poles: newPoles };
    });

    // 2. Staggered ripple: each upstream pole activates with increasing delay
    for (let i = 1; i <= 5; i++) {
      const delay = i * 150; // 150ms, 300ms, 450ms, 600ms, 750ms ripple
      setTimeout(() => {
        set((state) => {
          const upstreamIndex = id - i;
          if (upstreamIndex >= 0 && state.poles[upstreamIndex]) {
            if (state.poles[upstreamIndex].status !== 'CRASH') {
              const newPoles = [...state.poles];
              newPoles[upstreamIndex] = {
                ...newPoles[upstreamIndex],
                status: 'WARNING',
                mode: 'EMERGENCY_PULSE',
                brightness: 100,
              };
              return { poles: newPoles };
            }
          }
          return {};
        });
      }, delay);
    }
  },

  setWind: (speed: number) => set((state) => {
    // Wind affects visibility: high wind disperses fog slightly, but also kicks up spray in rain
    const visibility = calculateVisibility(state.env.fog, state.env.weather, speed);
    return {
      env: { ...state.env, windSpeed: speed, visibility }
    };
  }),

  /**
   * TIME CONTROL with mode priority:
   * CRASH/WARNING > GRID_FAILURE > FOG/WEATHER > DAYTIME_OFF > ECO > STANDARD
   * 0600-1800 = DAYTIME (lights OFF)
   * 0100-0400 = ECO MODE (30% brightness)
   */
  setTime: (time: number) => set((state) => {
    const isDaytime = time >= 600 && time <= 1800;
    const isEcoHours = time >= 100 && time <= 400;

    const newPoles = state.poles.map(p => {
      // Safety modes override everything
      if (p.status === 'CRASH' || p.status === 'WARNING') return p;
      
      // Grid failure: battery backup mode
      if (state.gridFailure) {
        return { ...p, mode: 'BATTERY' as PoleMode, brightness: 25 };
      }
      
      // Weather/fog safety overrides time modes
      if (state.env.fog) {
        return { ...p, mode: 'FOG_AMBER' as PoleMode, brightness: 100 };
      }
      
      // DAYTIME: 0600-1800 lights OFF
      if (isDaytime) {
        return { ...p, mode: 'STANDARD' as PoleMode, brightness: 0 };
      }
      
      // ECO MODE: 1 AM - 4 AM (only when no weather hazard)
      if (isEcoHours) {
        return { ...p, mode: 'ECO_DIM' as PoleMode, brightness: 30 };
      }
      
      // Standard night operation
      return { ...p, mode: 'STANDARD' as PoleMode, brightness: 40 };
    });

    return { 
      env: { ...state.env, time },
      poles: newPoles
    };
  }),

  /**
   * WEATHER CONTROL: Toggle between CLEAR, RAIN, and SNOW
   * Demonstrates weather resilience of the lighting system
   * Auto-enables fog mode for RAIN and SNOW conditions
   * CLEAR resets poles back to STANDARD mode
   * Visibility degrades with weather: RAIN=50%, SNOW=30%, FOG alone=40%
   * Vehicle speeds are capped by weather conditions in tick()
   */
  setWeather: (weather: WeatherType) => set((state) => {
    const needsFog = weather === 'RAIN' || weather === 'SNOW';
    const visibility = calculateVisibility(needsFog || state.env.fog, weather, state.env.windSpeed);
    
    const newPoles = state.poles.map(p => {
      // Don't override crash or warning states
      if (p.status === 'CRASH' || p.status === 'WARNING') return p;
      
      // Grid failure takes priority
      if (state.gridFailure) {
        return { ...p, mode: 'BATTERY' as PoleMode, brightness: 25 };
      }
      
      if (needsFog) {
        // SNOW: max brightness (worst visibility), RAIN: 90%
        const weatherBrightness = weather === 'SNOW' ? 100 : 90;
        return { ...p, mode: 'FOG_AMBER' as PoleMode, brightness: weatherBrightness };
      }
      
      // CLEAR: Reset poles based on time-of-day
      const isDaytime = state.env.time >= 600 && state.env.time <= 1800;
      if (isDaytime) {
        return { ...p, mode: 'STANDARD' as PoleMode, brightness: 0 };
      }
      const isEcoHours = state.env.time >= 100 && state.env.time <= 400;
      if (isEcoHours) {
        return { ...p, mode: 'ECO_DIM' as PoleMode, brightness: 30 };
      }
      return { ...p, mode: 'STANDARD' as PoleMode, brightness: 40 };
    });

    return {
      env: { ...state.env, weather, fog: needsFog || state.env.fog, visibility },
      poles: newPoles
    };
  }),

  /**
   * TICK: Simulation loop (runs every 200ms = 5x per second)
   * - Updates wind harvest based on wind speed
   * - Calculates carbon credits based on energy savings vs baseline
   * - Tracks power history for real-time telemetry graph (1 point/sec)
   * - Updates vehicle physics and radar detection
   */
  tick: () => set((state) => {
    const tickCount = state._tickCount + 1;

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

    // Update power history every 5 ticks (= once per second) to avoid graph flood
    let updatedHistory = state.powerHistory;
    if (tickCount % 5 === 0) {
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
      updatedHistory = [...state.powerHistory, newHistoryPoint];
      if (updatedHistory.length > 50) {
        updatedHistory.shift();
      }
    }

    // AUTO-TRAFFIC: Spawn vehicles automatically with ~0.6% chance per tick
    // At 5 ticks/sec, this creates roughly 1 vehicle every 30-35 seconds
    let vehiclesToUpdate = state.vehicles;
    if (state.autoTraffic && Math.random() < 0.006) {
      const isTruck = Math.random() < 0.3; // 30% chance of truck
      const newVehicle: Vehicle = {
        id: Date.now() + Math.random(),
        x_pos: 0,
        speed: isTruck ? 40 + Math.random() * 30 : 80 + Math.random() * 40, // Trucks: 40-70, Cars: 80-120
        lane: isTruck ? 1 : (Math.random() > 0.5 ? 1 : 2), // Trucks prefer lane 1 (slow lane)
        type: isTruck ? 'truck' : 'car',
      };
      vehiclesToUpdate = [...state.vehicles, newVehicle];
    }

    // VEHICLE PHYSICS ENGINE
    // Move vehicles forward based on speed (200ms tick = 1/5 second)
    // Highway is 2km = 100% width, so speed % per tick = speed / (72 * 5) = speed / 360
    // Weather caps effective speed for realism
    const speedMultiplier = getWeatherSpeedMultiplier(state.env.weather, state.env.fog);
    const updatedVehicles = vehiclesToUpdate
      .map(vehicle => {
        const effectiveSpeed = Math.min(vehicle.speed, vehicle.speed * speedMultiplier);
        return {
          ...vehicle,
          x_pos: vehicle.x_pos + (effectiveSpeed / 360), // 200ms tick movement
        };
      })
      .filter(vehicle => vehicle.x_pos <= 105); // Remove vehicles that drove off-screen

    // RADAR DETECTION LOGIC
    // Each pole covers ~5% of the highway (20 poles = 100%)
    const updatedPoles = state.poles.map((pole, index) => {
      // Auto-recover CRASH/WARNING states (~8 second average recovery)
      if (pole.status === 'CRASH' || pole.status === 'WARNING') {
        if (Math.random() < 0.024) {
          // Recover: determine correct mode based on current env
          const isDaytime = state.env.time >= 600 && state.env.time <= 1800;
          const isEcoHours = state.env.time >= 100 && state.env.time <= 400;
          let recoveryMode: PoleMode = 'STANDARD';
          let recoveryBrightness = 40;
          if (state.gridFailure) {
            recoveryMode = 'BATTERY';
            recoveryBrightness = 25;
          } else if (state.env.fog) {
            recoveryMode = 'FOG_AMBER';
            // Weather-specific brightness: snow=100, rain=90, fog-only=80
            recoveryBrightness = state.env.weather === 'SNOW' ? 100 : state.env.weather === 'RAIN' ? 90 : 80;
          } else if (isDaytime) {
            recoveryMode = 'STANDARD';
            recoveryBrightness = 0;
          } else if (isEcoHours) {
            recoveryMode = 'ECO_DIM';
            recoveryBrightness = 30;
          }
          return {
            ...pole,
            status: 'ACTIVE' as PoleStatus,
            mode: recoveryMode,
            brightness: recoveryBrightness,
          };
        }
        return pole;
      }

      const polePosition = (index / 19) * 100; // 0% to 100%
      const detectionRange = 15; // ±15% detection zone (20% total window per pole)

      // Check if any vehicle is near this pole
      const vehicleDetected = updatedVehicles.some(
        vehicle => Math.abs(vehicle.x_pos - polePosition) <= detectionRange
      );

      // PREDICTIVE LIGHTING: Boost brightness when vehicle detected
      if (vehicleDetected) {
        return {
          ...pole,
          brightness: 100, // Full brightness for safety
        };
      }

      // Fade back to standard brightness based on mode
      let standardBrightness = 40;
      if (pole.mode === 'FOG_AMBER') {
        // Weather-specific: snow=100, rain=90, fog-only=80
        standardBrightness = state.env.weather === 'SNOW' ? 100 : state.env.weather === 'RAIN' ? 90 : 80;
      }
      if (pole.mode === 'ECO_DIM') standardBrightness = 30;
      if (pole.mode === 'BATTERY') standardBrightness = 25;
      
      // Daytime: lights off (brightness 0) unless fog/grid override
      const isDaytime = state.env.time >= 600 && state.env.time <= 1800;
      if (isDaytime && !state.env.fog && !state.gridFailure) standardBrightness = 0;

      return {
        ...pole,
        brightness: pole.brightness > standardBrightness 
          ? Math.max(standardBrightness, pole.brightness - 3) // Gradual fade (scaled for 200ms tick)
          : standardBrightness,
      };
    });

    return {
      metrics: {
        powerDraw: newPowerDraw,
        carbonCredits: state.metrics.carbonCredits + (savings * 0.00002), // Accumulate credits (scaled for 200ms tick)
      },
      poles: updatedPoles.map(p => ({
        ...p,
        windHarvest: Number(harvestPerPole.toFixed(2)),
      })),
      powerHistory: updatedHistory,
      vehicles: updatedVehicles,
      _tickCount: tickCount,
    };
  }),

  /**
   * SPAWN VEHICLE: Creates a new vehicle at the start of the highway
   */
  spawnVehicle: (forceType?: VehicleType) => set((state) => {
    const isTruck = forceType === 'truck' || (!forceType && Math.random() < 0.3);
    const newVehicle: Vehicle = {
      id: Date.now() + Math.random(),
      x_pos: 0,
      speed: isTruck ? 40 + Math.random() * 30 : 80 + Math.random() * 40, // Trucks: 40-70, Cars: 80-120
      lane: isTruck ? 1 : (Math.random() > 0.5 ? 1 : 2),
      type: isTruck ? 'truck' : 'car',
    };

    return {
      vehicles: [...state.vehicles, newVehicle],
    };
  }),

  /**
   * SPAWN TRAFFIC JAM: Burst-spawn 6-8 vehicles close together
   * Creates a cluster of slow-moving vehicles with trucks mixed in
   * Shows the lighting grid illuminating in sequence as the jam passes
   */
  spawnTrafficJam: () => set((state) => {
    const count = 6 + Math.floor(Math.random() * 3); // 6-8 vehicles
    const jamVehicles: Vehicle[] = [];
    for (let i = 0; i < count; i++) {
      const isTruck = Math.random() < 0.4; // 40% trucks in a jam
      jamVehicles.push({
        id: Date.now() + Math.random() + i,
        x_pos: i * 3, // Spaced 3% apart (tight cluster)
        speed: isTruck ? 25 + Math.random() * 15 : 35 + Math.random() * 20, // Slow: 25-55 km/h
        lane: Math.random() > 0.4 ? 1 : 2, // Spread across both lanes
        type: isTruck ? 'truck' : 'car',
      });
    }
    return { vehicles: [...state.vehicles, ...jamVehicles] };
  }),

  /**
   * TOGGLE AUTO-TRAFFIC: Enable/disable automatic vehicle spawning
   */
  toggleAutoTraffic: () => set((state) => ({
    autoTraffic: !state.autoTraffic
  })),

  /**
   * GRID FAILURE: Simulates main power grid going offline
   * All poles switch to battery backup (25% brightness, orange tint)
   * Toggle on/off
   */
  triggerGridFailure: () => set((state) => {
    const newGridState = !state.gridFailure;
    
    const newPoles = state.poles.map(p => {
      if (p.status === 'CRASH' || p.status === 'WARNING') return p;
      
      if (newGridState) {
        return { ...p, mode: 'BATTERY' as PoleMode, brightness: 25 };
      }
      
      // Restore: determine correct mode
      const isDaytime = state.env.time >= 600 && state.env.time <= 1800;
      const isEcoHours = state.env.time >= 100 && state.env.time <= 400;
      if (state.env.fog) {
        return { ...p, mode: 'FOG_AMBER' as PoleMode, brightness: 100 };
      }
      if (isDaytime) {
        return { ...p, mode: 'STANDARD' as PoleMode, brightness: 0 };
      }
      if (isEcoHours) {
        return { ...p, mode: 'ECO_DIM' as PoleMode, brightness: 30 };
      }
      return { ...p, mode: 'STANDARD' as PoleMode, brightness: 40 };
    });

    return { gridFailure: newGridState, poles: newPoles };
  }),

  reset: () => set({
    poles: generatePoles(20),
    vehicles: [], // Clear traffic
    env: { fog: false, windSpeed: 10, time: 2000, weather: 'CLEAR', visibility: 100 },
    metrics: { powerDraw: 2.4, carbonCredits: 0 },
    powerHistory: [], // Clear history on reset
    autoTraffic: false, // Reset auto-traffic
    gridFailure: false, // Reset grid
    _tickCount: 0,
  })
}));