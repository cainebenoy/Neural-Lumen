Technology Stack

Neural-Lumen Digital Twin

Designed for rapid development (Caine's 48hr turnaround) and high visual fidelity. This stack prioritizes Client-Side Performance since the entire simulation runs in the browser.

1. Frontend Core

Framework: Next.js 14 (App Router)

Why: Provides the project scaffolding, routing, and optimization out of the box. We will use the src/app directory structure.

Language: TypeScript (v5.x)

Why: Non-negotiable for this project. The simulation involves complex objects (Pole, SensorData). Strict typing prevents "undefined" crashes during the simulation loop.

Runtime: Node.js (LTS) for local development.

2. State Management & Simulation Engine

Global State: Zustand

Why: We need a centralized store (useSimulationStore) that exists outside the React component tree to prevent massive re-renders. Zustand is significantly faster and less boilerplate-heavy than Redux for high-frequency updates (60fps simulation ticks).

Simulation Loop: React useEffect + requestAnimationFrame

Why: For the traffic movement and "Pulse" effects, requestAnimationFrame ensures smooth visual updates synchronized with the browser's refresh rate, avoiding the "stutter" of standard setInterval.

3. Styling & Theming (The "Cyberpunk" Look)

CSS Framework: Tailwind CSS (v3.4)

Config: Custom configuration required for the "Safety Amber" (#F59E0B) and "Cool White" (#F8FAFC) glow effects.

Utility Libraries:

clsx & tailwind-merge: Essential. The Pole component will have complex conditional classes (e.g., bg-red-500 if crashed, animate-pulse if warning). These libraries allow you to merge these classes cleanly without conflicts.

Fonts: next/font

Inter: For UI text.

JetBrains Mono: For numerical data (Dashboard numbers), ensuring they don't jitter when values change.

Icons: Lucide React

Why: Lightweight SVG icons. We specifically need: Wind (Turbine), Zap (Power), CloudFog (Weather), AlertTriangle (Crash).

4. Animation & Interaction (The "Wow" Factor)

Animation Library: Framer Motion

Usage:

Layout Animations: For the Sidebar sliding in/out.

The "Pulse": Using animate={{ opacity: [1, 0.5, 1] }} for the V2I warning effect.

The Traffic: Smooth x-axis translation of vehicle dots.

5. Data Visualization (The Dashboard)

Charting Library: Recharts

Why: Lightweight, composable React components. Perfect for the "Real-time Power Consumption" area chart.

Alternative: If Recharts is too heavy, raw SVG rectangles will be used for simple bar charts.

6. DevOps & Deployment

Hosting: Vercel

Configuration: Zero-config deployment.

Version Control: GitHub

Linting: ESLint + Prettier (Standard Next.js config).

7. Recommended Project Structure

/src
  /app
    /layout.tsx       # Global fonts & background
    /page.tsx         # Main simulation view
  /components
    /simulation
      /Highway.tsx    # The road container
      /Pole.tsx       # The individual light unit (Complex Logic)
      /Vehicle.tsx    # Moving dot
    /dashboard
      /Sidebar.tsx    # God Mode controls
      /Stats.tsx      # Power/Carbon graphs
    /ui               # Shared buttons/sliders
  /lib
    /store.ts         # Zustand logic (The Brain)
    /utils.ts         # Math helpers (Rayleigh scattering calc)
    /constants.ts     # Physics constants (Max Wattage, etc.)
