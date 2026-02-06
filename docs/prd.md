Product Requirements Document (PRD)

Project: Neural-Lumen Digital Twin (MVP)

Version: 2.0 (Comprehensive)
Author: Caine Benoy
Status: Implementation Ready
Target Platform: Web (Desktop First, Tablet Responsive)

1. Executive Summary

Neural-Lumen is a browser-based "Digital Twin" simulation of a next-generation smart highway lighting network. It serves as an interactive Proof of Concept (PoC) for the NHAI Innovation Hackathon. The application demonstrates a decentralized, neuro-adaptive lighting grid that responds to environmental hazards (fog), traffic accidents, and grid instability in real-time, validating the feasibility of the proposed hardware without physical deployment.

Primary Objective: To visually and mathematically demonstrate that the "Neural-Lumen" system improves safety by 40% (via fog penetration & warnings) and reduces OPEX by 60% (via adaptive dimming) compared to legacy highway lighting.

2. User Personas & Journey

Primary User (The Judge/Expert): A technical evaluator looking for algorithmic depth. They will try to "break" the system by toggling conflicting states (e.g., Fog + Eco Mode) to see if safety overrides energy savings.

Secondary User (The Investor): Focuses on the "Financial Dashboard" to verify the carbon credit logic and ROI calculations.

3. Functional Requirements

3.1 Module A: The Virtual Highway (Visualization)

FR-01: Highway Rendering: The system must render a linear array of 20 Lighting Poles representing a 2km highway stretch.

FR-02: Traffic Simulation:

Visual representation of vehicles (simple UI elements or moving dots) traversing the highway from Left to Right.

Ability to spawn "Heavy Vehicles" (Trucks) vs "Light Vehicles" (Cars).

FR-03: Pole Visualization: Each pole acts as a distinct node with visual indicators for:

Light Cone: The area illuminated on the road.

Structure: The physical pole.

Turbine: A rotating element indicating wind energy harvesting.

Status LED: A small dot indicating connectivity health (Green=Online, Red=Offline).

3.2 Module B: Neuro-Adaptive Lighting Logic

The core "Hard Tech" logic simulated in the browser.

FR-04: Standard Operating Mode (Default):

Condition: Night time, Clear Weather, Normal Traffic.

Output: CCT 6500K (Cool White), Brightness 80%.

FR-05: Fog-Penetrating Mode (Safety Priority):

Trigger: Simulated Visibility < 100m OR Humidity > 85%.

Output: CCT Shift to 2200K (Amber/Orange). Brightness 100%.

Acceptance Criteria: Transition must be smooth (cross-fade), not abrupt.

FR-06: Eco-Dimming Mode (Sustainability):

Trigger: Traffic Density = 0 for > 30 seconds AND Time is between 01:00 - 04:00.

Output: Brightness drops to 20% (Security levels). CCT shifts to 3000K (Warm White).

Override: Instant return to 100% if Radar detects a vehicle entering the sector.

FR-07: The "Pulse" Protocol (V2I Communication):

Trigger: "Crash Event" initiated on Pole $N$.

Logic: Poles $N-1$ to $N-5$ (upstream) activate "Warning Mode".

Output: Visual "Breathing" animation (Opacity oscillates 1.0 $\leftrightarrow$ 0.5 at 0.5Hz). Color remains White/Amber (does not turn Red to avoid blinding drivers).

3.3 Module C: The "God Mode" Control Panel

A sidebar interface for the user to manipulate simulation variables.

FR-08: Weather Controls:

Toggle: "Clear" vs "Dense Fog" vs "Rain".

Slider: "Wind Speed" (0 to 100 km/h) - drives the Turbine animation speed.

FR-09: Event Injection:

Button: "Crash at Random Location".

Button: "Spawn Traffic Jam".

Button: "Simulate Grid Failure" (Switches poles to Battery Power).

FR-10: Time Travel:

Slider: 24-hour clock. Dragging to "Daytime" turns lights OFF. Dragging to "3 AM" triggers Eco Mode checks.

3.4 Module D: Analytics Dashboard (The ROI Calculator)

Real-time metrics calculated every simulation tick (1000ms).

FR-11: Power Telemetry:

Display "Current Grid Load" (kW). Formula: $\sum(\text{PoleBrightness} \times \text{MaxWattage})$.

FR-12: Carbon Credit Ticker:

Display "Carbon Credits Earned".

Logic: Accumulate credits when (Actual Consumption < Baseline Consumption).

FR-13: System Health:

Display "Uptime %" and "Nodes Active".

4. Simulation Algorithms & Math

4.1 Energy Logic

Baseline (Legacy): 150W per pole $\times$ 20 poles = 3,000W constant load.

Neural-Lumen (Smart):

Standard: 120W (80%).

Eco: 30W (20%).

Fog: 150W (100%).

Harvesting Offset:

Turbine Output $P_w = 0.5 \times \text{WindSpeed}^3$ (clamped to max 50W).

Net Grid Draw = (Smart Consumption) - (Turbine Output).

4.2 Linear Mesh Propagation (The "Pulse")

When Pole $ID_{15}$ crashes:

Message hops upstream: $15 \to 14 \to 13 \to 12 \to 11 \to 10$.

Latency Simulation: Pole 14 reacts in 100ms, Pole 13 in 200ms... Pole 10 in 500ms. (Visual ripple effect).

5. Non-Functional Requirements

NFR-01: Visual Fidelity: The "Amber" light must authentically resemble sodium-vapor/amber LED wavelengths (Hex #FFB300 or similar), distinct from the "Cool White" (#F8FAFC).

NFR-02: Performance: Animations (especially the Pulse effect) must run at 60 FPS using CSS hardware acceleration or Framer Motion. No jank allowed.

NFR-03: Responsiveness: Layout must adapt to Laptop (1366x768) and Full HD (1920x1080) screens without scrolling the highway view.

6. UI/UX Guidelines Reference

Theme: "Industrial Cyberpunk" / "Control Room".

Colors: Dark mode strict (Slate-950 background). Neon accents for status.

Typography: Monospace numbers for data reliability perception.

7. Success Criteria for MVP

The "Fog Test": Toggling Fog instantly changes the lighting spectrum across the array.

The "Safety Test": Triggering a crash visually warns the "driver" (user) looking at the upstream poles.

The "Money Test": The Carbon Credit counter visibly moves faster when "Eco Mode" is active compared to "Standard Mode".