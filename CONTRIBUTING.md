# Contributing to Neural-Lumen

Thank you for your interest in contributing to the Neural-Lumen Smart Highway Lighting System!

## 🎯 Project Overview

Neural-Lumen is an AI-powered highway lighting simulation built for the **NHAI Hackathon 2025**. It demonstrates intelligent pole management, traffic prediction using TensorFlow.js, and real-time energy optimization.

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20+ and npm
- **Mapbox Access Token** (get free at https://mapbox.com)
- Modern browser (Chrome/Edge recommended for ML features)

### Setup
```bash
# Clone repository
git clone <repository-url>
cd neural-lumen

# Install dependencies
npm install

# Configure environment
# Create .env.local and add:
# NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here

# Start development server
npm run dev
```

## 📝 Development Guidelines

### Code Style
- **TypeScript** for all source files
- **ESLint** for linting (`npm run lint`)
- **Tailwind CSS** for styling (follow existing patterns)
- Use **functional components** with hooks

### Component Structure
```
src/
├── components/
│   ├── simulation/   # Map, poles, traffic visualization
│   ├── dashboard/    # Analytics, graphs, sidebar
│   └── ui/           # Reusable UI components
├── lib/
│   ├── store.ts      # Zustand global state
│   ├── constants.ts  # Configuration constants
│   └── utils.ts      # Utility functions
```

### State Management
- Use **Zustand** for global state (`store.ts`)
- Keep component state local when possible
- Follow existing patterns for actions and selectors

### Adding New Features

#### 1. New Pole Mode
```typescript
// In store.ts - Add to PoleMode type
type PoleMode = 
  | 'normal' 
  | 'your-new-mode'
  | ...

// Add update logic in tick function
if (pole.mode === 'your-new-mode') {
  // Your logic here
}
```

#### 2. New Weather Condition
```typescript
// In store.ts - Add to WeatherCondition type
type WeatherCondition = 
  | 'clear' 
  | 'your-weather'
  | ...

// Update weather effects in applicable functions
```

#### 3. New Analytics Panel
```typescript
// Create component in components/dashboard/
// Import and add to Sidebar.tsx
```

### ML Model Modifications

The traffic predictor uses TensorFlow.js with a Dense Neural Network:

```typescript
// lib/trafficPredictor.ts
function createModel() {
  const model = tf.sequential();
  // Modify architecture here
}
```

**Training Tips:**
- Increase epochs for better accuracy (currently 50)
- Add more historical patterns for diverse scenarios
- Adjust learning rate in optimizer (default: 0.001)
- Monitor loss - should be < 0.01 for good predictions

## 🧪 Testing

### Manual Testing Checklist
- [ ] Build completes without errors (`npm run build`)
- [ ] All 12 pole modes function correctly
- [ ] Weather transitions work smoothly
- [ ] ML training completes successfully
- [ ] Auto-spawn traffic generates vehicles
- [ ] Power graph updates in real-time
- [ ] No console errors (warnings OK)

### Performance Benchmarks
- Build time: < 15 seconds
- ML training: < 2 seconds
- Simulation tick: < 100ms (2000 poles)
- Memory usage: < 500MB

## 📊 Key Metrics

When adding features, maintain these standards:
- **Energy Savings**: Track via `totalEnergySaved`
- **Safety Score**: Calculate from incident-free time
- **Coverage**: Ensure no dark zones on highway
- **Performance**: Maintain 60 FPS in simulation

## 🐛 Reporting Issues

When reporting bugs:
1. Check console for errors
2. Note your browser and OS
3. Describe steps to reproduce
4. Include screenshots if applicable

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [TensorFlow.js Guide](https://www.tensorflow.org/js/guide)
- [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Recharts Examples](https://recharts.org/en-US/examples)

## 🎓 Learning Path

Recommended order for understanding the codebase:
1. Start with **store.ts** (state management)
2. Review **constants.ts** (configuration)
3. Examine **Pole.tsx** (core visualization)
4. Study **Sidebar.tsx** (UI controls)
5. Explore **trafficPredictor.ts** (ML system)

## 🏆 Hackathon Judges

This project demonstrates:
- **Modern Stack**: Next.js 16, React 19, TypeScript 5
- **AI Integration**: Real TensorFlow.js neural networks
- **Real-world Application**: NHAI highway safety optimization
- **Production Quality**: 0 build errors, comprehensive docs
- **Scalability**: Handles 2000+ poles efficiently

## 📜 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Mapbox** for geospatial visualization
- **TensorFlow.js** for browser-based ML
- **Vercel** for Next.js framework
- **NHAI** for hackathon opportunity

---

**Ready to contribute?** Fork the repo, make your changes, and submit a PR!

*Neural-Lumen Team | NHAI Hackathon 2025*
