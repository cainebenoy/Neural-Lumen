Frontend Design Guidelines

Neural-Lumen UI/UX v3.5 (Real Operator Console Edition)

1. Aesthetic Theme: "Tactile Industrial Control"

The UI simulates a physical hardware console used to manage the highway grid. It relies on texture, depth (shadows/highlights), and physical metaphors to create a sense of realism.

Core Vibe: Heavy Industry, Physical Controls, Retro-Modern, Tactile.

Background (The Chassis): Dark, matte industrial metal or high-quality dark plastic.

CSS: bg-[#141517] bg-[radial-gradient(#2c2e33_1px,transparent_1px)] bg-[size:18px_18px] (Perforated metal look).

Mounting Details: Add 4-6 small screw heads in the chassis corners using radial gradients.

Top Status Rail: A narrow strip above the main console.

Content: System mode (AUTO/MANUAL pill lamps), Time, and "PLANT ID / HIGHWAY ID" in small, dim monospace (text-slate-500).

Panels (The Modules): Raised "modules" screwed into the chassis.

Standard: bg-[#25262b] border-t border-l border-[#373a40] border-b border-r border-[#141517] shadow-[4px_4px_10px_rgba(0,0,0,0.55),-1px_-1px_2px_rgba(255,255,255,0.04)] rounded-lg.

Critical: Add border-[rgba(248,113,113,0.4)] inner stroke and tiny red corner LEDs.

Engraving: Large labels at the top of modules (text-[10px] tracking-[0.25em] text-slate-500/70 shadow-[0_1px_0_rgba(0,0,0,0.9)] uppercase).

2. Semantic Color Palette (Physical Materials)

Colors should feel like physical lights or materials, not just hex codes.

Role

Material/Look

Tailwind Logic

Chassis

Dark Grey Powder Coat

bg-[#141517]

Screen Black

Unlit LCD Segment

bg-[#0a0a0a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]

LED Green

Status OK

bg-emerald-500 shadow-[0_0_8px_#10b981] border border-emerald-600

LED Red

Critical Alert

bg-red-600 shadow-[0_0_10px_#dc2626] border border-red-700

Amber Light

Sodium Vapor (Fog)

text-[#ffaa00] drop-shadow-[0_0_15px_#ffaa00]

Cool Light

LED Phosphor

text-[#e0f2fe] drop-shadow-[0_0_15px_#e0f2fe]

3. Component Specifications

A. The HighwayContainer (The Viewport)

Simulates a large glass monitor or window embedded in the console.

Frame: Thick bezel with inset shadow and subtle parallax reflection.

relative border-8 border-[#141517] rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,1)] bg-black overflow-hidden.

Reflection: absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent mix-blend-screen opacity-20 pointer-events-none.

The Road:

Texture: Grainy asphalt pattern (bg-neutral-900).

Markings: Faded white paint (opacity-80).

B. PoleNode (The Bulb)

Should look like a physical light source viewed from above with mounting hardware.

The Fixture (Top Layer z-20):

Cap: relative w-4 h-4 rounded-full bg-gradient-to-br from-slate-300 to-slate-700 shadow-[1px_1px_2px_rgba(0,0,0,0.9)].

Mounting Ring: absolute inset-0.5 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)].

The Filament/Light (Bottom Layer z-10):

Glow: absolute -inset-3 rounded-full.

Standard: bg-[radial-gradient(circle_at_center,rgba(200,240,255,0.9)_0%,rgba(200,240,255,0)_60%)].

Fog (Amber): bg-[radial-gradient(circle_at_center,rgba(255,170,0,0.9)_0%,rgba(255,170,0,0)_60%)].

C. Controls (The Control Deck)

A panel of physical switches, sliders, and buttons.

Rocker Switch (Toggle):

Track: w-12 h-6 rounded-full bg-black shadow-[inset_0_1px_3px_rgba(0,0,0,0.85)] border border-slate-800.

Thumb: w-5 h-5 rounded-full bg-gradient-to-b from-slate-200 to-slate-500 shadow-[0_2px_3px_rgba(0,0,0,0.7)].

Action: Thumb translates x-6, Track becomes bg-emerald-500/40.

Label: Tiny "ON / OFF" printed near the switch.

Fader (Slider):

Track: h-24 w-[3px] bg-black shadow-[inset_0_0_4px_rgba(0,0,0,0.9)] rounded-full relative.

Thumb: w-5 h-8 bg-slate-700 border-t border-slate-500 border-l border-slate-600 rounded-[3px] shadow-[2px_2px_5px_rgba(0,0,0,0.9)].

Detail: Add subtle tick marks along the side.

Mushroom Button (Primary Action):

Style: w-20 h-20 rounded-full bg-gradient-to-b from-red-400 to-red-700 shadow-[0_6px_0_#7f1d1d,0_10px_20px_rgba(0,0,0,0.85)] border border-red-900.

Press: active:translate-y-[6px] active:shadow-[0_0_0_#7f1d1d].

Label: "EMERGENCY STOP" or "TEST".

D. Displays & Readouts

Simulates digital segment displays.

HUD Container:

bg-black/85 border border-slate-700/60 rounded-md px-4 py-3 shadow-[0_0_15px_rgba(0,0,0,0.9)] backdrop-blur-sm.

Typography:

Counters: font-mono text-lg text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.7)].

Logs: Dot-matrix style text-[#e0f2fe]/80.

LED Labels: Tiny round LEDs (w-1.5 h-1.5) next to text labels to indicate active status.

4. Animation & Interaction Guidelines

Micro-Feedback

Tactile Press: Use whileTap={{ scale: 0.95 }} on all buttons.

Switch Shake: Tiny 1-2px jiggle when toggling critical switches.

Glow Ramp: Transitions for LEDs should use duration-150 to simulate phosphor ramp-up/down, not instant on/off.

FX 1: The "Pulse" (V2I Warning)

Visual: Rotation or Beacon effect.

<motion.div
  animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.95, 1.05, 0.95] }}
  transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
  className="bg-red-500/15 rounded-full"
/>


FX 2: The Fog Overlay

Texture: Seamless noise texture (opacity-10) sliding slowly across the screen.

5. Mobile Responsiveness

Mechanical Drawer:

On mobile, the "Control Deck" slides up from the bottom.

Handle: w-12 h-1.5 bg-slate-500/60 rounded-full mx-auto mt-2 shadow-[0_1px_0_rgba(0,0,0,0.9)] (Metal grip).

Appearance: bg-[#25262b] border-t border-[#111] shadow-[0_-6px_20px_rgba(0,0,0,0.9)] rounded-t-2xl.