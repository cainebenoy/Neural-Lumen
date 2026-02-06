Implementation Plan

Neural-Lumen MVP (Digital Twin)

Builder: Caine Benoy
Stack: Next.js 14, TypeScript, Tailwind, Zustand, Framer Motion.
Goal: Functional Simulator in < 6 Hours.

Phase 1: Project Scaffolding (30 Mins)

Initialization:

npx create-next-app@latest neural-lumen --typescript --tailwind --eslint
cd neural-lumen
npm install framer-motion lucide-react zustand clsx tailwind-merge recharts


Clean & Configure:

File: src/app/globals.css

Remove all default Next.js CSS.

Add base layer:

@layer base {
  body {
    @apply bg-slate-950 text-slate-50 overflow-hidden;
    background-image: linear-gradient(to right, #1e293b 1px, transparent 1px),
                      linear-gradient(to bottom, #1e293b 1px, transparent 1px);
    background-size: 40px 40px;
  }
}


File: src/app/layout.tsx

Change metadata title to "NHAI Neural-Lumen: Digital Twin".

Import JetBrains Mono and Inter from next/font/google.

Directory Structure:

src/lib (Store, Utils)

src/components/simulation (Visuals)

src/components/dashboard (Controls/Charts)

src/components/ui (Shared Buttons/Sliders)

Phase 2: The Logic Engine (1 Hour)

The Store (src/lib/store.ts):

Step A: Define Interfaces (Pole, SimulationState) based on the Backend Schema.

Step B: Implement generatePoles(count: 20) helper:

Loop i from 0 to 19.

Assign x_pos: i * 5 (5% spacing).

Default mode: 'STANDARD', status: 'ACTIVE'.

Step C: Create Zustand Store useSimulationStore:

Action toggleFog(isFoggy):

Iterate state.poles.

If isFoggy: Set mode = 'FOG_AMBER', brightness = 100.

Else: Set mode = 'STANDARD', brightness = 80.

Update state.weather.visibility = 50.

Action triggerCrash(poleId):

Set poles[poleId].status = 'CRASH'.

The Mesh Logic:

const upstreamIds = [id - 1, id - 2, id - 3, id - 4, id - 5];
upstreamIds.forEach(targetId => {
  if (targetId >= 0) state.poles[targetId].mode = 'EMERGENCY_PULSE';
});


Action tick(delta):

Increment total_energy_saved.

Update turbine_rotation based on wind_speed.

Move vehicles x-position by speed * delta.

Phase 3: The Visuals (1.5 Hours)

The Pole Component (src/components/simulation/Pole.tsx):

Props: Pole object.

Render:

The Cone: Absolute positioned motion.div.

Standard: bg-gradient-radial from-cyan-100/30 to-transparent

Fog: from-amber-500/50 (Higher opacity).

Pulse: Use animate={{ opacity: [0.3, 1, 0.3] }} if mode is EMERGENCY_PULSE.

The Stick: <div className="w-1 h-24 bg-slate-700" />.

The Head: <div className="w-4 h-1 bg-slate-400" />.

The Turbine: <Wind className="text-emerald-500 animate-spin" style={{ animationDuration: windSpeed + 's' }} />.

The Highway (src/components/simulation/Highway.tsx):

Container: relative w-full h-64 flex items-end justify-between px-10.

The Road: <div className="absolute bottom-0 w-full h-24 bg-slate-900 border-t-2 border-slate-700" />.

Loop: Map store.poles and render <Pole /> components.

Phase 4: Dashboard & Controls (1 Hour)

Sidebar (src/components/dashboard/Sidebar.tsx):

UI: Fixed right panel, w-80 backdrop-blur-md border-l border-slate-800.

Section 1: Weather:

Toggle: "Fog Simulation" (Calls toggleFog).

Slider: "Wind Speed" (Updates store wind_speed).

Section 2: Events:

Button: "Crash Test (Pole 18)" (Calls triggerCrash(18)).

Section 3: Time:

Slider: 0 - 2400. If val matches 0100-0400, trigger Eco logic.

Analytics (src/components/dashboard/Analytics.tsx):

Top Bar:

Display Carbon Credits using countup effect.

Display Grid Load (kW).

Graph: Use Recharts <AreaChart> to show "Power Consumption vs Time".

Phase 5: Polish & Assembly (1 Hour)

Main Page (src/app/page.tsx):

Layout:

<Header /> (Logo + Title).

<main className="flex-1 relative"> -> <Highway />.

<Sidebar />.

Simulation Loop:

useEffect(() => {
  const interval = setInterval(() => tick(1), 1000); // 1Hz tick
  return () => clearInterval(interval);
}, []);


Narrative Toasts:

Create a simple Notification.tsx component.

Trigger it inside the Store actions (e.g., when Fog is enabled, show "Rayleigh Scattering Optimized").

Phase 6: Submission (30 Mins)

Lint & Build: npm run build. Fix any strict TypeScript errors (usually any types).

Deploy: Connect to Vercel.

Readme:

Title: "Neural-Lumen Digital Twin".

Instruction: "Click 'Simulate Fog' to see Dual-CCT Logic."

Export: Download ZIP from GitHub.