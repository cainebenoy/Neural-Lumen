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
export const TOTAL_POLES = 2000; // Full-scale India highway network
export const LEGACY_BASELINE_POWER = LEGACY_CONSUMPTION_PER_POLE * TOTAL_POLES; // 300000W = 300kW

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

// ============ GEOGRAPHIC HIGHWAY ROUTES ============
// Major and Secondary National Highway routes across India for geospatial visualization
// 20+ routes covering the entire country for comprehensive network coverage
export const HIGHWAY_ROUTES = [
  {
    name: 'NH44 (Srinagar-Kanyakumari)',
    path: [
      [34.0837, 74.7973], // Srinagar
      [32.7266, 74.8570], // Jammu
      [30.7333, 76.7794], // Chandigarh
      [28.7041, 77.1025], // Delhi
      [27.1767, 78.0081], // Agra
      [26.9124, 75.7873], // Jaipur
      [23.1765, 75.7885], // Bhopal
      [21.1458, 79.0882], // Nagpur
      [17.3850, 78.4867], // Hyderabad
      [13.0827, 80.2707], // Chennai
      [12.9716, 77.5946], // Bangalore
      [8.5241, 76.9366],  // Kanyakumari
    ] as [number, number][],
  },
  {
    name: 'NH48 (Delhi-Mumbai)',
    path: [
      [28.7041, 77.1025], // Delhi
      [27.1767, 78.0081], // Agra  
      [26.9124, 75.7873], // Jaipur
      [23.0225, 72.5714], // Ahmedabad
      [22.3072, 73.1812], // Vadodara
      [21.1702, 72.8311], // Surat
      [19.0760, 72.8777], // Mumbai
    ] as [number, number][],
  },
  {
    name: 'NH27 (Gujarat-Assam)',
    path: [
      [22.3072, 70.8022], // Porbandar
      [23.0225, 72.5714], // Ahmedabad
      [25.2677, 82.9913], // Varanasi
      [25.5941, 85.1376], // Patna
      [26.1445, 91.7362], // Guwahati
    ] as [number, number][],
  },
  {
    name: 'NH2/GT Road (Delhi-Kolkata)',
    path: [
      [28.7041, 77.1025], // Delhi
      [28.4595, 77.0266], // Gurgaon
      [27.1767, 78.0081], // Agra
      [25.4358, 81.8463], // Allahabad
      [25.2677, 82.9913], // Varanasi
      [25.5941, 85.1376], // Patna
      [23.6102, 85.2799], // Ranchi
      [22.5726, 88.3639], // Kolkata
    ] as [number, number][],
  },
  {
    name: 'Mumbai-Pune Expressway',
    path: [
      [19.0760, 72.8777], // Mumbai
      [18.5204, 73.8567], // Pune
    ] as [number, number][],
  },
  {
    name: 'NH1 (Delhi-Amritsar)',
    path: [
      [28.7041, 77.1025], // Delhi
      [29.0588, 77.7043], // Panipat
      [30.2139, 77.6471], // Karnal
      [31.5497, 76.6427], // Ambala
      [31.8204, 75.7670], // Ludhiana
      [31.6340, 74.8723], // Amritsar
    ] as [number, number][],
  },
  {
    name: 'NH5 (Chennai-Kolkata)',
    path: [
      [13.0827, 80.2707], // Chennai
      [12.8271, 79.7297], // Tirupati
      [15.2993, 78.8591], // Nellore
      [16.5062, 80.6480], // Vijayawada
      [17.6869, 83.2185], // Visakhapatnam
      [19.8135, 85.2845], // Bhubaneswar
      [22.5726, 88.3639], // Kolkata
    ] as [number, number][],
  },
  {
    name: 'NH7 (Varanasi-Kanyakumari)',
    path: [
      [25.2677, 82.9913], // Varanasi
      [23.1765, 75.7885], // Bhopal
      [21.1458, 79.0882], // Nagpur
      [19.0760, 72.8777], // Mumbai
      [15.2993, 75.8106], // Belgaum
      [12.9716, 77.5946], // Bangalore
      [11.4102, 79.8299], // Nellore
      [8.5241, 76.9366],  // Kanyakumari
    ] as [number, number][],
  },
  {
    name: 'NH3 (Agra-Mumbai via Indore)',
    path: [
      [27.1767, 78.0081], // Agra
      [24.1772, 79.9864], // Indore
      [21.2458, 79.8711], // Khandwa
      [20.1809, 73.8537], // Dhule
      [19.0760, 72.8777], // Mumbai
    ] as [number, number][],
  },
  {
    name: 'NH6 (Kolkata-Mumbai)',
    path: [
      [22.5726, 88.3639], // Kolkata
      [23.1815, 86.4144], // Asansol
      [24.5155, 87.5771], // Gaya
      [25.5941, 85.1376], // Patna
      [25.2677, 82.9913], // Varanasi
      [23.1765, 75.7885], // Bhopal
      [21.1458, 79.0882], // Nagpur
      [19.0760, 72.8777], // Mumbai
    ] as [number, number][],
  },
  {
    name: 'NH9 (Chennai-Bangalore)',
    path: [
      [13.0827, 80.2707], // Chennai
      [12.9716, 77.5946], // Bangalore
    ] as [number, number][],
  },
  {
    name: 'NH11 (Kota-Agra)',
    path: [
      [25.2083, 75.8244], // Kota
      [27.1767, 78.0081], // Agra
    ] as [number, number][],
  },
  {
    name: 'NH12 (Jaipur-Indore)',
    path: [
      [26.9124, 75.7873], // Jaipur
      [25.4244, 75.5245], // Ajmer
      [24.1772, 79.9864], // Indore
    ] as [number, number][],
  },
  {
    name: 'NH16 (Chennai-Kolkata via Vijayawada)',
    path: [
      [13.0827, 80.2707], // Chennai
      [15.2993, 78.8591], // Nellore
      [16.5062, 80.6480], // Vijayawada
      [17.6869, 83.2185], // Visakhapatnam
      [19.8135, 85.2845], // Bhubaneswar
      [22.5726, 88.3639], // Kolkata
    ] as [number, number][],
  },
  {
    name: 'NH19 (Bengaluru-Tamil Nadu)',
    path: [
      [12.9716, 77.5946], // Bangalore
      [11.8088, 79.7298], // Chittoor
      [11.4102, 79.8299], // Tirupati
    ] as [number, number][],
  },
  {
    name: 'NH26 (Aligarh-Lucknow)',
    path: [
      [27.8950, 77.2996], // Aligarh
      [26.8467, 80.9462], // Lucknow
    ] as [number, number][],
  },
  {
    name: 'NH31 (Siliguri-Assam)',
    path: [
      [26.5333, 88.4167], // Siliguri
      [26.1445, 91.7362], // Guwahati
    ] as [number, number][],
  },
  {
    name: 'NH35 (Bhubaneswar-Kolkata)',
    path: [
      [19.8135, 85.2845], // Bhubaneswar
      [20.6297, 87.2556], // Durgapur
      [22.5726, 88.3639], // Kolkata
    ] as [number, number][],
  },
  {
    name: 'NH37 (Assam)',
    path: [
      [26.1445, 91.7362], // Guwahati
      [26.6124, 92.9575], // Dibrugarh
    ] as [number, number][],
  },
  {
    name: 'Western Coastal Highway (Goa-Kerala)',
    path: [
      [15.4909, 73.8278], // Goa
      [12.9822, 75.2721], // Kochi
      [11.8088, 75.0721], // Kottayam
    ] as [number, number][],
  },
  {
    name: 'East Coast Road (Chennai-Kolkata)',
    path: [
      [13.0827, 80.2707], // Chennai
      [14.0059, 80.2721], // Chengalpattu
      [17.6869, 83.2185], // Visakhapatnam
      [19.8135, 85.2845], // Bhubaneswar
      [22.5726, 88.3639], // Kolkata
    ] as [number, number][],
  },
  {
    name: 'NH55 (Kolkata-Guwahati)',
    path: [
      [22.5726, 88.3639], // Kolkata
      [24.5155, 87.5771], // Gaya
      [25.5941, 85.1376], // Patna
      [26.1445, 91.7362], // Guwahati
    ] as [number, number][],
  },
  {
    name: 'NH75 (Vadodara-Ajmer-Jaipur)',
    path: [
      [22.3072, 73.1812], // Vadodara
      [25.4244, 75.5245], // Ajmer
      [26.9124, 75.7873], // Jaipur
    ] as [number, number][],
  },
];

// ============ MAJOR CITIES ============
// City markers for geographic context on the map
export const MAJOR_CITIES = [
  { name: 'Delhi', coords: [28.7041, 77.1025] as [number, number], population: '32M' },
  { name: 'Mumbai', coords: [19.0760, 72.8777] as [number, number], population: '21M' },
  { name: 'Bangalore', coords: [12.9716, 77.5946] as [number, number], population: '13M' },
  { name: 'Chennai', coords: [13.0827, 80.2707] as [number, number], population: '11M' },
  { name: 'Kolkata', coords: [22.5726, 88.3639] as [number, number], population: '15M' },
  { name: 'Hyderabad', coords: [17.3850, 78.4867] as [number, number], population: '10M' },
  { name: 'Ahmedabad', coords: [23.0225, 72.5714] as [number, number], population: '8M' },
  { name: 'Pune', coords: [18.5204, 73.8567] as [number, number], population: '7M' },
  { name: 'Jaipur', coords: [26.9124, 75.7873] as [number, number], population: '4M' },
  { name: 'Lucknow', coords: [26.8467, 80.9462] as [number, number], population: '4M' },
  { name: 'Surat', coords: [21.1702, 72.8311] as [number, number], population: '8M' },
  { name: 'Nagpur', coords: [21.1458, 79.0882] as [number, number], population: '3M' },
  { name: 'Bhopal', coords: [23.1765, 75.7885] as [number, number], population: '2M' },
  { name: 'Patna', coords: [25.5941, 85.1376] as [number, number], population: '2M' },
  { name: 'Guwahati', coords: [26.1445, 91.7362] as [number, number], population: '1M' },
  { name: 'Chandigarh', coords: [30.7333, 76.7794] as [number, number], population: '1M' },
  { name: 'Kochi', coords: [9.9312, 76.2673] as [number, number], population: '2M' },
  { name: 'Visakhapatnam', coords: [17.6869, 83.2185] as [number, number], population: '2M' },
  { name: 'Srinagar', coords: [34.0837, 74.7973] as [number, number], population: '2M' },
  { name: 'Kanyakumari', coords: [8.0883, 77.5385] as [number, number], population: '0.1M' },
];

// ============ WILDLIFE CORRIDORS ============
// Eco-sensitive zones where Bio-Shield activates more frequently
// Based on major wildlife sanctuaries and forest areas along highways
export const WILDLIFE_CORRIDORS = [
  { 
    name: 'Kaziranga Corridor (Assam)',
    center: [26.5775, 93.1711] as [number, number],
    radius: 50000, // meters
    species: ['Elephant', 'Rhino', 'Tiger'],
  },
  { 
    name: 'Gir Forest Corridor (Gujarat)',
    center: [21.1239, 70.8242] as [number, number],
    radius: 40000,
    species: ['Lion', 'Leopard', 'Deer'],
  },
  { 
    name: 'Bandipur-Nagarhole (Karnataka)',
    center: [11.6717, 76.2711] as [number, number],
    radius: 45000,
    species: ['Elephant', 'Tiger', 'Gaur'],
  },
  { 
    name: 'Jim Corbett Corridor (Uttarakhand)',
    center: [29.5300, 78.7747] as [number, number],
    radius: 35000,
    species: ['Tiger', 'Elephant', 'Deer'],
  },
  { 
    name: 'Sundarbans Corridor (West Bengal)',
    center: [21.9497, 88.8997] as [number, number],
    radius: 60000,
    species: ['Tiger', 'Crocodile', 'Deer'],
  },
  { 
    name: 'Western Ghats Corridor (Kerala)',
    center: [10.1632, 76.6413] as [number, number],
    radius: 55000,
    species: ['Elephant', 'Leopard', 'Gaur'],
  },
  { 
    name: 'Pench Tiger Reserve (MP)',
    center: [21.7500, 79.3000] as [number, number],
    radius: 30000,
    species: ['Tiger', 'Leopard', 'Deer'],
  },
  { 
    name: 'Ranthambore Corridor (Rajasthan)',
    center: [26.0173, 76.5026] as [number, number],
    radius: 35000,
    species: ['Tiger', 'Leopard', 'Nilgai'],
  },
];

// ============ ROUTE COLORS ============
// Color coding for different highway types
export const ROUTE_COLORS = {
  primary: '#3b82f6',   // Blue - Major national highways (NH44, NH48)
  secondary: '#8b5cf6', // Purple - Secondary routes
  coastal: '#06b6d4',   // Cyan - Coastal highways
  mountain: '#f59e0b',  // Amber - Mountain routes
  forest: '#10b981',    // Emerald - Forest corridors
};
