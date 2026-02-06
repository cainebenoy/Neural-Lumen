Data Model / Schema

Neural-Lumen Digital Twin

This document defines the data structures for the frontend simulation and the corresponding SQL schema for a production-grade Supabase backend.

1. TypeScript Interfaces (Simulation Engine)

These interfaces define the shape of the data used in the React/Zustand store.

A. Core Infrastructure (Pole)

Represents a single physical smart pole.

export type PoleStatus = 'ACTIVE' | 'WARNING' | 'CRITICAL_FAULT' | 'OFFLINE';
export type LightMode = 'STANDARD' | 'FOG_AMBER' | 'ECO_DIM' | 'EMERGENCY_PULSE';

export interface Pole {
  // Identity
  id: number;                 // Index 0-19 for simulation array
  uuid: string;               // UUID for DB mapping
  km_marker: string;          // Display label e.g., "120.5"
  coordinates: {              // For canvas rendering
    x: number;
    y: number; 
  };
  
  // Actuator State (The Light)
  status: PoleStatus;
  mode: LightMode;
  brightness: number;         // 0 to 100%
  color_temp: number;         // 2200 (Amber) to 6500 (Cool White)
  
  // IoT Sensor Telemetry (Read-only inputs)
  sensors: {
    radar_motion: boolean;    // True if vehicle detected in sector
    radar_speed: number;      // km/h of detected object
    mic_decibel: number;      // Ambient noise level
    lux_ambient: number;      // Daylight sensor
    humidity: number;         // %
  };

  // Hardware Health (Simulated)
  hardware: {
    battery_charge: number;   // 0-100%
    grid_voltage: number;     // Nominal 230V
    power_draw_w: number;     // Real-time consumption
    harvest_rate_w: number;   // VAWT generation
  };

  // Network Topology
  mesh_neighbors: number[];   // IDs of upstream/downstream poles
}


B. Dynamic Entities (Vehicle, Alert)

Objects that move or appear transiently in the simulation.

export type VehicleType = 'CAR' | 'TRUCK' | 'EMERGENCY';

export interface Vehicle {
  id: string;
  type: VehicleType;
  position_x: number;         // 0 to 100% of highway length
  lane: 1 | 2 | 3;
  speed_kmh: number;
}

export interface Alert {
  id: string;
  timestamp: number;
  pole_id: number;
  type: 'CRASH' | 'THEFT' | 'GRID_FAILURE';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}


C. Global State (SimulationStore)

The master object managed by Zustand.

export interface SimulationState {
  // 1. Environment Controls (God Mode)
  env: {
    time_of_day: number;      // 0 - 2400 (Float for smooth transition)
    weather_condition: 'CLEAR' | 'FOG' | 'RAIN';
    fog_density: number;      // 0.0 - 1.0 (Opacity multiplier)
    wind_speed_kmh: number;   // Drives turbine animation
    traffic_density: 'ZERO' | 'LOW' | 'HIGH';
  };

  // 2. Data Arrays
  poles: Pole[];
  vehicles: Vehicle[];
  alerts: Alert[];

  // 3. ROI / Financials (Computed Real-time)
  analytics: {
    total_power_draw_kw: number;
    baseline_power_draw_kw: number; // What legacy lights would use
    total_energy_saved_kwh: number;
    carbon_credits_earned: number;
    active_safety_incidents: number;
  };

  // 4. Actions
  actions: {
    setWeather: (w: 'CLEAR' | 'FOG' | 'RAIN') => void;
    setTime: (hour: number) => void;
    spawnCrash: (poleId: number) => void;
    resetSim: () => void;
    tick: (delta: number) => void; // The loop driver
  };
}


2. SQL Schema (Supabase / PostgreSQL)

If this MVP moves to production, this is the exact database schema required.

Table: infrastructure_poles

Master registry of assets.

Column

Type

Description

id

uuid

Primary Key

serial_number

text

e.g., "NHAI-DL-001"

geo_lat

float8

GPS Latitude

geo_lng

float8

GPS Longitude

firmware_version

text

e.g., "v2.1.0"

cluster_id

uuid

Foreign key to Gateway Pole

Table: telemetry_logs

High-volume time-series data (Partitioned by month).

Column

Type

Description

timestamp

timestamptz

Indexed time

pole_id

uuid

FK

status

text

'ACTIVE', 'FAULT'

light_mode

text

'FOG', 'ECO', 'STD'

power_w

int4

Wattage consumption

harvest_w

int4

Wind/Solar generation

sensor_radar_cnt

int4

Traffic count in last 5m

Table: incident_alerts

Critical events for the Command Center.

Column

Type

Description

id

uuid

PK

created_at

timestamptz

Time of incident

pole_id

uuid

Location of detection

type

text

'CRASH_ACOUSTIC', 'THEFT_IMPEDANCE'

confidence_score

float4

AI Model confidence (0.0-1.0)

resolved

boolean

Resolution status

3. Mathematical Constants & Physics Models

Constants used in the frontend simulation logic.

A. Energy Model

MAX_LED_WATTAGE = 150 W (Standard Highway Light).

DRIVER_EFFICIENCY = 0.95.

VAWT_MAX_OUTPUT = 60 W (at 12 m/s wind).

BATTERY_CAPACITY = 1200 Wh (LiFePO4 12V 100Ah).

B. Carbon Economics (CCTS 2025)

GRID_EMISSION_FACTOR_INDIA = 0.82 kgCO2/kWh.

CARBON_CREDIT_PRICE_INR = ₹1200 (Estimated 2026 value).

C. Lighting Physics

LUMINOUS_EFFICACY_WHITE = 140 lm/W.

LUMINOUS_EFFICACY_AMBER = 110 lm/W (Lower due to phosphor losses).

RAYLEIGH_SCATTERING_COEFF_BLUE = 1.0 (Baseline).

RAYLEIGH_SCATTERING_COEFF_AMBER = 0.2 (5x better penetration).

D. Network Timings

MESH_HOP_LATENCY = 50 ms (Wirepas Standard).

PULSE_ANIMATION_DURATION = 2000 ms.