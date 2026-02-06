Application User Flow

Neural-Lumen Simulation

This document maps the detailed user journey and system logic from initialization to complex scenario execution. It serves as the "Logic Map" for the Frontend State Machine.

1. Initialization State (The "Default Night")

Context: The user loads the application. The system represents a typical high-traffic evening on a National Highway.

User Action: Opens web app URL.

System Logic (State Initialization):

poles[]: Generate 20 objects (IDs 0-19).

time: Set to 20:00 (8:00 PM).

weather: Set to CLEAR (Visibility: 1000m, Humidity: 40%).

trafficDensity: Set to HIGH.

gridSource: GRID_MAIN (100%).

Visual Output:

Highway: Dark Asphalt (bg-slate-900).

Poles: All 20 poles emitting Cool White (6500K) light at 100% Brightness.

Dashboard:

Power Draw: ~3.0 kW (Simulation baseline).

Carbon Credits: 0.

Status: "OPTIMAL".

2. Scenario A: The Safety Demo (Crash & Linear Mesh Response)

Context: Demonstrating the V2I "Pulse" warning system.

User Action: Clicks "Simulate Crash" button in the sidebar OR clicks directly on Pole #18 (near the end of the visible stretch).

System Logic:

Event Injection: Pole[18].status set to CRASH.

Mesh Propagation Algorithm:

Calculate Upstream Neighbors: TargetID - 1 to TargetID - 5.

Identify set: [17, 16, 15, 14, 13].

Command Dispatch:

Pole[18]: Set visual state to Critical Red (Blinking).

Poles[13-17]: Set mode to WARNING_PULSE.

UI Feedback:

Toast Notification: "⚠️ ANOMALY detected at Pole 18. Mesh Alert propagating upstream."

Visual Output:

Pole 18: Flashes Red (#EF4444) rapidly (4Hz).

Poles 13-17: Begin the "Pulse" Animation:

Animation: Smooth Opacity oscillation (100% $\to$ 50% $\to$ 100%).

Timing: 2-second cycle (0.5Hz).

Color: Remains White (No color change, to avoid confusion with taillights).

3. Scenario B: The Weather Demo (Fog-Penetrating Mode)

Context: Demonstrating the Rayleigh Scattering physics solution (Dual-CCT).

User Action: Toggles "Weather: Dense Fog" switch in the "God Mode" panel.

System Logic:

Sensor Simulation:

Global.Visibility set to 40m (Critical).

Global.Humidity set to 95%.

Controller Response:

Trigger onWeatherChange event.

Iterate all Active poles.

Update Pole.colorMode: COOL_WHITE $\to$ AMBER_2200K.

Update Pole.lightRadius: Increase by 20% (Simulating penetration).

Visual Output:

Transition: A smooth 2-second CSS cross-fade.

Color: Light shifts from Ice Blue/White (#F8FAFC) to Deep Sodium Orange (#F59E0B).

Atmosphere: A "Fog Layer" (semi-transparent overlay) appears over the road to visually sell the weather condition.

Dashboard: "SPECTRAL SHIFT ACTIVE: 2200K Penetration Mode."

4. Scenario C: The Sustainability Demo (Eco-Dimming & Harvesting)

Context: Demonstrating energy savings during "Ghost Hours" (3 AM).

User Action: Drags the Time Slider from 20:00 to 03:00.

System Logic:

Time Check: System detects time is within 01:00 - 04:00 window.

Traffic Check: System checks TrafficDensity. Since user moved to 3 AM, auto-set TrafficDensity to ZERO.

Eco Trigger:

Wait 2 seconds (Simulation of "No Motion Timer").

Update Pole.brightness: 100% $\to$ 30%.

Update Pole.colorMode: WARM_WHITE_3000K (Less light pollution).

Financial Math Update:

CurrentLoad = 20 poles * 30W = 0.6 kW (vs 3.0 kW baseline).

CarbonCredits = (Baseline - Current) * TimeDelta * EmissionFactor.

Visual Output:

Lighting: The road becomes noticeably darker, but still visible (Security lighting).

Turbines: Small "Wind Turbine" icons on poles spin faster (simulating night winds).

Dashboard: The "Carbon Credits Earned" counter begins ticking up 4x faster.

5. Scenario D: The Traffic Override (Motion Sensing)

Context: Proving that Safety > Efficiency. (Happens during Scenario C).

User Action: While in Eco Mode (3 AM), user clicks "Spawn Vehicle".

System Logic:

Radar Trigger: Vehicle object enters the zone of Pole #0.

Predictive Lighting:

Pole #0 detects motion.

System activates Poles #0, #1, #2 to 100% Brightness.

"Follow Me" Effect:

As vehicle moves to Pole #1, Poles #3 activates.

Pole #0 (behind) fades back to 30% after 5 seconds.

Visual Output: A "Wave of Light" travels with the car, illuminating its path while leaving the rest of the highway dim.

6. Reset & Loop

User Action: Clicks "Reset Simulation".

System Action:

Clear all intervals.

Reset poles[] to default state.

Reset Counters.

Remove all Fog/Crash overlays.