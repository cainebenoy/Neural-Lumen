/**
 * Physics & Energy Constants
 * Based on Neural-Lumen Backend Schema & Technical Specifications
 */

// ============ ENERGY MODEL ============
export const MAX_LED_WATTAGE = 150; // Standard Highway Light (W)
export const DRIVER_EFFICIENCY = 0.95; // Driver efficiency factor
export const VAWT_MAX_OUTPUT = 60; // Max VAWT output @ 12 m/s (W)
export const BATTERY_CAPACITY = 1200; // LiFePO4 12V 100Ah (Wh)

// Actual consumption per mode (as percentage of max)
export const CONSUMPTION_STANDARD = 120; // 80% brightness
export const CONSUMPTION_FOG = 150; // 100% brightness
export const CONSUMPTION_ECO = 30; // 20% brightness (ghost hours)

// ============ CARBON ECONOMICS (CCTS 2025) ============
export const GRID_EMISSION_FACTOR_INDIA = 0.82; // kgCO2/kWh
export const CARBON_CREDIT_PRICE_INR = 1200; // Estimated 2026 value (₹)

// Legacy baseline (what legacy lights would consume)
export const LEGACY_CONSUMPTION_PER_POLE = 150; // W
export const TOTAL_POLES = 20;
export const LEGACY_BASELINE_POWER = LEGACY_CONSUMPTION_PER_POLE * TOTAL_POLES; // 3000W

// ============ LIGHTING PHYSICS ============
export const LUMINOUS_EFFICACY_WHITE = 140; // lm/W
export const LUMINOUS_EFFICACY_AMBER = 110; // lm/W (lower due to phosphor losses)

// Rayleigh Scattering coefficients (fog penetration model)
export const RAYLEIGH_SCATTERING_COEFF_BLUE = 1.0; // Baseline
export const RAYLEIGH_SCATTERING_COEFF_AMBER = 0.2; // 5x better penetration in fog

// Color Temperature (Kelvin)
export const COLOR_TEMP_COOL_WHITE = 6500; // Standard highway lighting
export const COLOR_TEMP_WARM_WHITE = 3000; // Eco-dimming (reduced light pollution)
export const COLOR_TEMP_FOG_AMBER = 2200; // Fog-penetrating mode

// ============ NETWORK TIMINGS ============
export const MESH_HOP_LATENCY = 50; // ms (Wirepas Standard)
export const PULSE_ANIMATION_DURATION = 2000; // ms
export const PULSE_FREQUENCY = 0.5; // Hz (1 cycle = 2 seconds)

// ============ SIMULATION PARAMETERS ============
export const SIMULATION_TICK_RATE = 1000; // ms (1 second per tick)
export const FOG_DENSITY_THRESHOLD = 100; // meters visibility
export const HUMIDITY_THRESHOLD = 85; // % RH to trigger fog mode
export const TRAFFIC_DENSITY_ZERO_TIMEOUT = 2000; // ms before eco trigger

// Mesh propagation parameters
export const MESH_UPSTREAM_HOPS = 5; // Poles upstream to alert in crash scenario
export const VEHICLE_DETECTION_RANGE = 1; // Pole sectors ahead

// ============ FINANCIAL CONSTANTS ============
export const CARBON_CREDIT_RATE_MULTIPLIER = 0.001; // Carbon accumulated per simulation tick
export const ECO_MODE_CREDIT_MULTIPLIER = 4; // Credits accumulate 4x faster in eco mode
