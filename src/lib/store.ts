import { create } from 'zustand';

/**
 * Neural-Lumen Digital Twin Store
 * Smart Highway Lighting Simulation with Industrial Cyberpunk Aesthetic
 */

// Notification helper - lazy import to prevent circular dependencies
type NotifyFn = (type: 'crash' | 'weather' | 'grid' | 'info' | 'success', title: string, message: string) => void;
type EventFn = (type: 'crash' | 'weather' | 'grid' | 'info' | 'success', message: string) => void;

let showNotification: NotifyFn | null = null;
let addSystemEvent: EventFn | null = null;

const notify = (type: 'crash' | 'weather' | 'grid' | 'info' | 'success', title: string, message: string) => {
  // Show toast notification
  if (!showNotification) {
    import('@/components/ui/Notifications').then(mod => {
      showNotification = mod.showNotification as NotifyFn;
      showNotification(type, title, message);
    });
  } else {
    showNotification(type, title, message);
  }
  
  // Add to event log
  if (!addSystemEvent) {
    import('@/components/ui/EventLog').then(mod => {
      addSystemEvent = mod.addSystemEvent as EventFn;
      addSystemEvent(type, `${title}: ${message}`);
    });
  } else {
    addSystemEvent(type, `${title}: ${message}`);
  }
};

// TypeScript Interfaces
export type PoleMode = 'STANDARD' | 'FOG_AMBER' | 'ECO_DIM' | 'EMERGENCY_PULSE' | 'BATTERY' | 'CORRIDOR_BLUE' | 'HAZARD_RED' | 'SPOTLIGHT_WHITE' | 'INTERCEPT_STROBE' | 'STOP_BARRIER';
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

export type VehicleType = 'car' | 'truck' | 'ambulance';

export interface Vehicle {
  id: number;
  x_pos: number; // Position along highway (0-100%)
  speed: number; // km/h
  lane: number; // 1 or 2
  type: VehicleType; // Car (light, fast) or Truck (heavy, slow)
}

// Geographic vehicle for map visualization
export interface GeoVehicle {
  id: number;
  routeIndex: number; // Which highway route (0-4)
  progress: number; // Position along route (0-1)
  speed: number; // km/h
  type: VehicleType;
  lane: number; // 1 or 2 for offset
}

interface SimulationState {
  poles: Pole[];
  vehicles: Vehicle[]; // Traffic physics simulation (2D highway view)
  geoVehicles: GeoVehicle[]; // Geographic vehicles (map view)
  env: {
    fog: boolean;
    windSpeed: number; // km/h
    time: number; // 24-hour format (0-2400)
    weather: WeatherType; // CLEAR, RAIN, or SNOW
    visibility: number; // 0-100% visibility (100 = clear, 0 = zero visibility)
  };
  metrics: {
    powerDraw: number; // kW (consumption only)
    turbineOutput: number; // kW harvested from wind turbines
    netGridDraw: number; // kW (powerDraw - turbineOutput)
    carbonCredits: number; // Accumulated credits
    livesSaved: number; // Golden Hour Protocol impact
    accidentsPrevented: number; // Phantom Shield impact
    interceptsCount: number; // Neural Intercept wrong-way driver stops
  };
  powerHistory: PowerHistoryPoint[]; // Real-time telemetry (max 50 points)
  autoTraffic: boolean; // Auto-spawn vehicles (2D view)
  autoGeoTraffic: boolean; // Auto-spawn vehicles on map
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
  spawnVehicle: (forceType?: VehicleType, isStalled?: boolean, isWrongWay?: boolean) => void;
  spawnTrafficJam: () => void;
  toggleAutoTraffic: () => void;
  spawnGeoVehicle: (routeIndex?: number, forceType?: VehicleType) => void;
  spawnGeoTrafficBurst: () => void;
  toggleAutoGeoTraffic: () => void;
  triggerGridFailure: () => void;
}

// Initialize poles for the highway network
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
  // Initial State with 2000 poles across India's highway network
  poles: generatePoles(2000),
  vehicles: [], // Traffic simulation starts empty (2D view)
  geoVehicles: [], // Geographic vehicles (map view)
  env: { fog: false, windSpeed: 10, time: 2000, weather: 'CLEAR', visibility: 100 },
  metrics: { powerDraw: 24.0, turbineOutput: 0, netGridDraw: 24.0, carbonCredits: 0, livesSaved: 0, accidentsPrevented: 0, interceptsCount: 0 },
  powerHistory: [], // Start with empty history
  autoTraffic: false, // Auto-spawn disabled by default (2D view)
  autoGeoTraffic: true, // Auto-spawn enabled for map view by default
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
    
    // Show notification
    if (newFogState) {
      notify('weather', '🌫️ FOG MODE ACTIVE', 'Spectral shift to 2200K amber for optimal penetration.');
    } else {
      notify('info', 'Fog Cleared', 'Returning to standard lighting mode.');
    }
    
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
   * Sets target pole to 'CRASH' with red alert, then propagates WARNING to upstream poles
   * Staggered ripple: Pole N-1 reacts in 150ms, N-2 in 300ms... N-5 in 750ms
   */
  triggerCrash: (id: number) => {
    // Show notification
    notify('crash', '⚠️ CRASH DETECTED', `Pole #${id} anomaly. Mesh alert propagating upstream.`);
    
    // 1. Immediately set the crashed pole to bright red
    set((state) => {
      const newPoles = [...state.poles];
      if (newPoles[id]) {
        newPoles[id] = {
          ...newPoles[id],
          status: 'CRASH',
          brightness: 100, // Red glow at full brightness
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
      
      // ECO MODE: 1 AM - 4 AM AND no traffic (per PRD FR-06)
      const hasTraffic = state.vehicles.length > 0 || state.geoVehicles.length > 0;
      if (isEcoHours && !hasTraffic) {
        return { ...p, mode: 'ECO_DIM' as PoleMode, brightness: 30 };
      }
      
      // Eco hours but with traffic: stay at standard reduced brightness
      if (isEcoHours && hasTraffic) {
        return { ...p, mode: 'STANDARD' as PoleMode, brightness: 40 };
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
   * CLEAR weather turns OFF fog mode automatically (weather-induced fog clears)
   * Visibility degrades with weather: RAIN=50%, SNOW=30%, FOG alone=40%
   * Vehicle speeds are capped by weather conditions in tick()
   */
  setWeather: (weather: WeatherType) => set((state) => {
    // Show notification
    if (weather === 'RAIN') {
      notify('weather', '🌧️ Rain Detected', 'Activating amber mode for improved visibility.');
    } else if (weather === 'SNOW') {
      notify('weather', '❄️ Snow Conditions', 'Maximum brightness engaged. Drive with caution.');
    } else if (weather === 'CLEAR' && state.env.weather !== 'CLEAR') {
      notify('success', 'Weather Cleared', 'Returning to optimal lighting conditions.');
    }
    
    // RAIN/SNOW require fog mode; CLEAR turns fog OFF
    const newFogState = weather === 'RAIN' || weather === 'SNOW';
    const visibility = calculateVisibility(newFogState, weather, state.env.windSpeed);
    
    const newPoles = state.poles.map(p => {
      // Don't override crash or warning states
      if (p.status === 'CRASH' || p.status === 'WARNING') return p;
      
      // Grid failure takes priority
      if (state.gridFailure) {
        return { ...p, mode: 'BATTERY' as PoleMode, brightness: 25 };
      }
      
      if (newFogState) {
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
      env: { ...state.env, weather, fog: newFogState, visibility },
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

    // POWER CONSUMPTION MODEL
    // Max wattage per pole: 150W (from constants)
    // Brightness 0-100 maps to 0-150W
    const MAX_WATTS_PER_POLE = 150;
    const totalWatts = state.poles.reduce((acc, p) => {
      return acc + (p.brightness / 100) * MAX_WATTS_PER_POLE;
    }, 0);
    
    // Baseline: Legacy system always 100% brightness on all poles = 300kW for 2000 poles
    const baselineWatts = state.poles.length * MAX_WATTS_PER_POLE;
    const savings = Math.max(0, baselineWatts - totalWatts);
    
    // Wind harvest calculation per PRD: P = 0.5 × WindSpeed^3 (scaled and clamped to max 50W per pole)
    // Using (windSpeed/10)^3 to normalize for realistic VAWT output curves with variance
    const baseHarvest = 0.5 * Math.pow(state.env.windSpeed / 10, 3);
    const harvestPerPole = Math.min(50, baseHarvest * (0.8 + Math.random() * 0.4));

    // Convert to kW
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
        speed: isTruck ? 80 + Math.random() * 60 : 160 + Math.random() * 80, // Trucks: 80-140, Cars: 160-240
        lane: isTruck ? 1 : (Math.random() > 0.5 ? 1 : 2), // Trucks prefer lane 1 (slow lane)
        type: isTruck ? 'truck' : 'car',
      };
      vehiclesToUpdate = [...state.vehicles, newVehicle];
    }

    // AUTO-GEO-TRAFFIC: Spawn vehicles on map routes (higher frequency for dense traffic)
    let geoVehiclesToUpdate = state.geoVehicles;
    if (state.autoGeoTraffic && Math.random() < 0.15) { // 15% chance = ~0.75 vehicles/sec = 45/min
      const routeIndex = Math.floor(Math.random() * 5); // Random route (0-4)
      const isTruck = Math.random() < 0.25; // 25% trucks
      const newGeoVehicle: GeoVehicle = {
        id: Date.now() + Math.random(),
        routeIndex,
        progress: 0,
        speed: isTruck ? 60 + Math.random() * 40 : 80 + Math.random() * 60, // Trucks: 60-100, Cars: 80-140
        type: isTruck ? 'truck' : 'car',
        lane: Math.random() > 0.5 ? 1 : 2,
      };
      geoVehiclesToUpdate = [...state.geoVehicles, newGeoVehicle];
    }

    // VEHICLE PHYSICS ENGINE (2D Highway View)
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

    // GEO VEHICLE PHYSICS ENGINE (Map View)
    // Routes vary in length, so speed is normalized per route
    // Average route: ~1500km, tick = 0.2s, progress increment = (km/h) / (1500 * 18000)
    const updatedGeoVehicles = geoVehiclesToUpdate
      .map(vehicle => {
        const effectiveSpeed = Math.min(vehicle.speed, vehicle.speed * speedMultiplier);
        // Progress: 0-1 over route length, speed in km/h converted to progress/tick
        // Assume average 1500km route, 200ms tick: increment = speed / (1500 * 18000)
        const progressIncrement = effectiveSpeed / 27000000; // Calibrated for visible movement
        return {
          ...vehicle,
          progress: vehicle.progress + progressIncrement,
        };
      })
      .filter(vehicle => vehicle.progress <= 1.05); // Remove vehicles that completed route

    // GOLDEN HOUR PROTOCOL: Check for active ambulances
    const ambulance = updatedVehicles.find(v => v.type === 'ambulance');
    const ambulanceCorridorPoleIds: Set<number> = new Set();
    
    if (ambulance) {
      // Calculate 5 poles AHEAD of the ambulance (500m corridor)
      // Each pole covers ~5% of highway (2000 poles = 100%), so 5 poles = 0.25%
      // We need to find poles that are 0.25% to 2.5% ahead of ambulance position
      const ambulancePosition = ambulance.x_pos; // 0-100%
      const corridorStartPercent = ambulancePosition + 0.5; // Start just ahead
      const corridorEndPercent = ambulancePosition + 5; // 5% ahead (~500m)
      
      state.poles.forEach((pole, index) => {
        const polePosition = (index / (state.poles.length - 1)) * 100;
        if (polePosition > corridorStartPercent && polePosition <= corridorEndPercent) {
          ambulanceCorridorPoleIds.add(pole.id);
        }
      });
    }

    // PHANTOM SHIELD: Check for stalled vehicles (Ghost Trucks)
    const stalledVehicle = updatedVehicles.find(v => v.speed === 0);
    const hazardRedPoleIds: Set<number> = new Set();
    let spotlightPoleId: number | null = null;
    
    if (stalledVehicle) {
      const stalledPosition = stalledVehicle.x_pos; // 0-100%
      
      // Find the pole directly above the stalled vehicle (SPOTLIGHT_WHITE)
      let closestPoleIndex = 0;
      let minDistance = Infinity;
      state.poles.forEach((pole, index) => {
        const polePosition = (index / (state.poles.length - 1)) * 100;
        const distance = Math.abs(polePosition - stalledPosition);
        if (distance < minDistance) {
          minDistance = distance;
          closestPoleIndex = index;
          spotlightPoleId = pole.id;
        }
      });
      
      // Find 5 poles BEHIND (upstream) the stalled vehicle (HAZARD_RED warning zone)
      // Behind means lower position percentage (where approaching cars come from)
      const hazardStartPercent = stalledPosition - 5; // 5% behind (~500m)
      const hazardEndPercent = stalledPosition - 0.5; // End just behind
      
      state.poles.forEach((pole, index) => {
        const polePosition = (index / (state.poles.length - 1)) * 100;
        if (polePosition >= hazardStartPercent && polePosition < hazardEndPercent) {
          hazardRedPoleIds.add(pole.id);
        }
      });
    }

    // NEURAL INTERCEPT: Check for wrong-way drivers (Ghost Riders)
    const wrongWayVehicle = updatedVehicles.find(v => v.speed < 0);
    let interceptStrobePoleId: number | null = null;
    const stopBarrierPoleIds: Set<number> = new Set();
    
    if (wrongWayVehicle) {
      const roguePosition = wrongWayVehicle.x_pos; // 0-100%
      
      // Find the pole closest to the wrong-way driver (INTERCEPT_STROBE - Target Lock)
      let closestPoleIndex = 0;
      let minDistance = Infinity;
      state.poles.forEach((pole, index) => {
        const polePosition = (index / (state.poles.length - 1)) * 100;
        const distance = Math.abs(polePosition - roguePosition);
        if (distance < minDistance) {
          minDistance = distance;
          closestPoleIndex = index;
          interceptStrobePoleId = pole.id;
        }
      });
      
      // Find 10 poles UPSTREAM (ahead of the wrong-way driver in the direction of normal traffic)
      // This creates a STOP_BARRIER to warn innocent drivers coming from the start
      // Wrong-way driver moves from 100% to 0%, so upstream means LOWER position percentage
      const barrierStartPercent = Math.max(0, roguePosition - 10); // 10% behind (towards start)
      const barrierEndPercent = roguePosition - 1; // End just before rogue
      
      state.poles.forEach((pole, index) => {
        const polePosition = (index / (state.poles.length - 1)) * 100;
        if (polePosition >= barrierStartPercent && polePosition < barrierEndPercent) {
          stopBarrierPoleIds.add(pole.id);
        }
      });
    }

    // RADAR DETECTION LOGIC
    // Each pole covers ~5% of the highway (20 poles = 100%)
    const updatedPoles = state.poles.map((pole, index) => {
      // GOLDEN HOUR: Priority corridor for ambulance (overrides other modes)
      if (ambulanceCorridorPoleIds.has(pole.id)) {
        return {
          ...pole,
          mode: 'CORRIDOR_BLUE' as PoleMode,
          brightness: 100,
          status: 'ACTIVE' as PoleStatus,
        };
      }
      
      // PHANTOM SHIELD: Spotlight pole directly above stalled vehicle
      if (spotlightPoleId === pole.id) {
        return {
          ...pole,
          mode: 'SPOTLIGHT_WHITE' as PoleMode,
          brightness: 100,
          status: 'ACTIVE' as PoleStatus,
        };
      }
      
      // PHANTOM SHIELD: Hazard zone behind stalled vehicle
      if (hazardRedPoleIds.has(pole.id)) {
        return {
          ...pole,
          mode: 'HAZARD_RED' as PoleMode,
          brightness: 100,
          status: 'WARNING' as PoleStatus,
        };
      }
      
      // NEURAL INTERCEPT: Target Lock on wrong-way driver
      if (interceptStrobePoleId === pole.id) {
        return {
          ...pole,
          mode: 'INTERCEPT_STROBE' as PoleMode,
          brightness: 100,
          status: 'CRASH' as PoleStatus, // Critical status for target lock
        };
      }
      
      // NEURAL INTERCEPT: Stop barrier for innocent drivers
      if (stopBarrierPoleIds.has(pole.id)) {
        return {
          ...pole,
          mode: 'STOP_BARRIER' as PoleMode,
          brightness: 100,
          status: 'WARNING' as PoleStatus,
        };
      }
      
      // Reset special modes back to normal when no longer needed
      if ((pole.mode === 'CORRIDOR_BLUE' && !ambulanceCorridorPoleIds.has(pole.id)) ||
          (pole.mode === 'HAZARD_RED' && !hazardRedPoleIds.has(pole.id)) ||
          (pole.mode === 'SPOTLIGHT_WHITE' && spotlightPoleId !== pole.id) ||
          (pole.mode === 'INTERCEPT_STROBE' && interceptStrobePoleId !== pole.id) ||
          (pole.mode === 'STOP_BARRIER' && !stopBarrierPoleIds.has(pole.id))) {
        const isDaytime = state.env.time >= 600 && state.env.time <= 1800;
        const isEcoHours = state.env.time >= 100 && state.env.time <= 400;
        let resetMode: PoleMode = 'STANDARD';
        let resetBrightness = 40;
        if (state.gridFailure) {
          resetMode = 'BATTERY';
          resetBrightness = 25;
        } else if (state.env.fog) {
          resetMode = 'FOG_AMBER';
          resetBrightness = state.env.weather === 'SNOW' ? 100 : state.env.weather === 'RAIN' ? 90 : 80;
        } else if (isDaytime) {
          resetMode = 'STANDARD';
          resetBrightness = 0;
        } else if (isEcoHours) {
          resetMode = 'ECO_DIM';
          resetBrightness = 30;
        }
        return { ...pole, mode: resetMode, brightness: resetBrightness };
      }

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

      const polePosition = (index / (state.poles.length - 1)) * 100; // 0% to 100%
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
        // Total turbine output: harvestPerPole * number of poles (in kW)
        turbineOutput: Number(((harvestPerPole * state.poles.length) / 1000).toFixed(2)),
        // Net grid draw: consumption minus wind harvest
        netGridDraw: Number(Math.max(0, (totalWatts - (harvestPerPole * state.poles.length)) / 1000).toFixed(2)),
        // Carbon credit formula: (kWh saved) * Grid emission factor * credit rate
        // savings in Watts, tick is 200ms = 1/18000 hour
        // Grid emission factor India = 0.82 kgCO2/kWh
        // Simplified accumulation rate for visual feedback
        carbonCredits: state.metrics.carbonCredits + ((savings / 1000) * (1/18000) * 0.82 * 0.5),
        // Golden Hour Protocol: Increment lives saved when ambulance is active (~1 life per full corridor run)
        livesSaved: state.metrics.livesSaved + (ambulance ? 0.002 : 0),
        // Phantom Shield: Increment accidents prevented when stalled vehicle is detected (~1 accident prevented per minute of protection)
        accidentsPrevented: state.metrics.accidentsPrevented + (stalledVehicle ? 0.003 : 0),
        // Neural Intercept: Track active intercept (already counted on spawn, maintain current value)
        interceptsCount: state.metrics.interceptsCount,
      },
      poles: updatedPoles.map(p => ({
        ...p,
        windHarvest: Number(harvestPerPole.toFixed(2)),
      })),
      powerHistory: updatedHistory,
      vehicles: updatedVehicles,
      geoVehicles: updatedGeoVehicles,
      _tickCount: tickCount,
    };
  }),

  /**
   * SPAWN VEHICLE: Creates a new vehicle at the start of the highway
   * Supports car, truck, ambulance (Golden Hour Protocol), stalled vehicles (Phantom Shield), and wrong-way drivers (Neural Intercept)
   */
  spawnVehicle: (forceType?: VehicleType, isStalled?: boolean, isWrongWay?: boolean) => set((state) => {
    // Determine vehicle type
    const vehicleType: VehicleType = forceType || (Math.random() < 0.3 ? 'truck' : 'car');
    
    // NEURAL INTERCEPT: Wrong-way driver (Ghost Rider)
    if (isWrongWay) {
      notify('crash', '🚫 NEURAL INTERCEPT', 'Wrong-way driver detected! Activating Target Lock and Stop Barrier.');
      return {
        vehicles: [...state.vehicles, {
          id: Date.now() + Math.random(),
          x_pos: 100, // Start at end of highway
          speed: -150, // Negative speed (moving backwards/wrong way)
          lane: 2, // Fast lane (most dangerous)
          type: 'car' as VehicleType,
        }],
        metrics: {
          ...state.metrics,
          interceptsCount: state.metrics.interceptsCount + 1,
        },
      };
    }
    
    // PHANTOM SHIELD: Stalled vehicle (Ghost Truck)
    if (isStalled) {
      notify('crash', '⚠️ PHANTOM SHIELD', 'Unlit stationary truck detected. Activating hazard corridor behind.');
      return {
        vehicles: [...state.vehicles, {
          id: Date.now() + Math.random(),
          x_pos: 75 + Math.random() * 10, // 75-85% position (far down the highway)
          speed: 0, // Stalled!
          lane: 1, // Slow lane (shoulder/breakdown lane)
          type: 'truck' as VehicleType,
        }],
      };
    }
    
    // Ambulance: Golden Hour Protocol - priority emergency vehicle
    if (vehicleType === 'ambulance') {
      notify('crash', '🚑 GOLDEN HOUR PROTOCOL', 'Emergency corridor activated. Clearing fast lane ahead.');
      return {
        vehicles: [...state.vehicles, {
          id: Date.now() + Math.random(),
          x_pos: 0,
          speed: 200 + Math.random() * 40, // 200-240 km/h (1.5x normal traffic)
          lane: 2, // Fast lane always
          type: 'ambulance' as VehicleType,
        }],
      };
    }
    
    const isTruck = vehicleType === 'truck';
    const newVehicle: Vehicle = {
      id: Date.now() + Math.random(),
      x_pos: 0,
      speed: isTruck ? 80 + Math.random() * 60 : 160 + Math.random() * 80, // Trucks: 80-140, Cars: 160-240
      lane: isTruck ? 1 : (Math.random() > 0.5 ? 1 : 2),
      type: vehicleType,
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
    
    // Show notification
    notify('info', '🚗 Traffic Jam', `${count} vehicles spawned in convoy formation.`);
    
    for (let i = 0; i < count; i++) {
      const isTruck = Math.random() < 0.4; // 40% trucks in a jam
      jamVehicles.push({
        id: Date.now() + Math.random() + i,
        x_pos: i * 3, // Spaced 3% apart (tight cluster)
        speed: isTruck ? 50 + Math.random() * 40 : 70 + Math.random() * 40, // Jam speeds: 50-90 trucks, 70-110 cars
        lane: Math.random() > 0.4 ? 1 : 2, // Spread across both lanes
        type: isTruck ? 'truck' : 'car',
      });
    }
    return { vehicles: [...state.vehicles, ...jamVehicles] };
  }),

  /**
   * TOGGLE AUTO-TRAFFIC: Enable/disable automatic vehicle spawning (2D view)
   */
  toggleAutoTraffic: () => set((state) => ({
    autoTraffic: !state.autoTraffic
  })),

  /**
   * SPAWN GEO VEHICLE: Creates a new vehicle on a specific route (or random route)
   */
  spawnGeoVehicle: (routeIndex?: number, forceType?: VehicleType) => set((state) => {
    const route = routeIndex !== undefined ? routeIndex : Math.floor(Math.random() * 5);
    const isTruck = forceType === 'truck' || (!forceType && Math.random() < 0.25);
    const newGeoVehicle: GeoVehicle = {
      id: Date.now() + Math.random(),
      routeIndex: route,
      progress: 0,
      speed: isTruck ? 60 + Math.random() * 40 : 80 + Math.random() * 60,
      type: isTruck ? 'truck' : 'car',
      lane: Math.random() > 0.5 ? 1 : 2,
    };
    return {
      geoVehicles: [...state.geoVehicles, newGeoVehicle],
    };
  }),

  /**
   * SPAWN GEO TRAFFIC BURST: Creates multiple vehicles across all routes
   */
  spawnGeoTrafficBurst: () => set((state) => {
    const burst: GeoVehicle[] = [];
    let totalVehicles = 0;
    
    // Spawn 3-5 vehicles per route (15-25 total vehicles)
    for (let routeIdx = 0; routeIdx < 5; routeIdx++) {
      const count = 3 + Math.floor(Math.random() * 3);
      totalVehicles += count;
      for (let i = 0; i < count; i++) {
        const isTruck = Math.random() < 0.3;
        burst.push({
          id: Date.now() + Math.random() + routeIdx * 100 + i,
          routeIndex: routeIdx,
          progress: Math.random() * 0.3, // Spread along first 30% of route
          speed: isTruck ? 60 + Math.random() * 40 : 80 + Math.random() * 60,
          type: isTruck ? 'truck' : 'car',
          lane: Math.random() > 0.5 ? 1 : 2,
        });
      }
    }
    
    // Show notification
    notify('info', '🚗 Traffic Burst', `${totalVehicles} vehicles deployed across 5 routes.`);
    
    return { geoVehicles: [...state.geoVehicles, ...burst] };
  }),

  /**
   * TOGGLE AUTO-GEO-TRAFFIC: Enable/disable automatic vehicle spawning on map
   */
  toggleAutoGeoTraffic: () => set((state) => ({
    autoGeoTraffic: !state.autoGeoTraffic
  })),

  /**
   * GRID FAILURE: Simulates main power grid going offline
   * All poles switch to battery backup (25% brightness, orange tint)
   * Toggle on/off
   */
  triggerGridFailure: () => set((state) => {
    const newGridState = !state.gridFailure;
    
    // Show notification
    if (newGridState) {
      notify('grid', '⚡ GRID FAILURE', 'Switching to battery backup. 25% capacity.');
    } else {
      notify('success', 'Grid Restored', 'Main power online. Full capacity restored.');
    }
    
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

  reset: () => {
    // Show notification
    notify('success', 'System Reset', 'All parameters restored to defaults.');
    
    // Clear event log
    import('@/components/ui/EventLog').then(mod => mod.clearEventLog());
    
    return set({
      poles: generatePoles(2000),
      vehicles: [], // Clear traffic (2D view)
      geoVehicles: [], // Clear geo traffic (map view)
      env: { fog: false, windSpeed: 10, time: 2000, weather: 'CLEAR', visibility: 100 },
      metrics: { powerDraw: 24.0, turbineOutput: 0, netGridDraw: 24.0, carbonCredits: 0, livesSaved: 0, accidentsPrevented: 0, interceptsCount: 0 },
      powerHistory: [], // Clear history on reset
      autoTraffic: false, // Reset auto-traffic (2D)
      autoGeoTraffic: true, // Keep auto-geo-traffic enabled
      gridFailure: false, // Reset grid
      _tickCount: 0,
    });
  }
}));