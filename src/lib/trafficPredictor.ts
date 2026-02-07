/**
 * Neural Network Traffic Predictor for Neural-Lumen
 * 
 * Uses TensorFlow.js to train and run a Deep Neural Network
 * that predicts optimal vehicle spawn rates based on time patterns.
 * 
 * Features:
 * - Time-of-day pattern recognition (rush hours, low traffic periods)
 * - Day-of-week patterns (weekday vs weekend)
 * - Weather impact factor
 * - Real-time inference for adaptive spawn rates
 * - Dynamic TensorFlow.js import (browser-only) for Vercel/SSR compatibility
 */

// Dynamically import TensorFlow.js only in the browser to avoid SSR crashes
let tf: typeof import('@tensorflow/tfjs') | null = null;

async function getTf() {
  if (!tf) {
    if (typeof window === 'undefined') {
      throw new Error('TensorFlow.js can only run in the browser');
    }
    tf = await import('@tensorflow/tfjs');
  }
  return tf;
}

// Training data represents typical traffic patterns
// [hour (0-23), dayOfWeek (0-6), isRainOrSnow (0/1)] -> spawnRate (0-1)
const HISTORICAL_PATTERNS: [number[], number][] = [
  // Night time (0-5): Very low traffic
  [[0, 0, 0], 0.05], [[1, 0, 0], 0.03], [[2, 0, 0], 0.02], [[3, 0, 0], 0.02], [[4, 0, 0], 0.03], [[5, 0, 0], 0.08],
  [[0, 1, 0], 0.05], [[1, 1, 0], 0.03], [[2, 1, 0], 0.02], [[3, 1, 0], 0.02], [[4, 1, 0], 0.03], [[5, 1, 0], 0.08],
  [[0, 2, 0], 0.05], [[1, 2, 0], 0.03], [[2, 2, 0], 0.02], [[3, 2, 0], 0.02], [[4, 2, 0], 0.03], [[5, 2, 0], 0.08],
  [[0, 3, 0], 0.05], [[1, 3, 0], 0.03], [[2, 3, 0], 0.02], [[3, 3, 0], 0.02], [[4, 3, 0], 0.03], [[5, 3, 0], 0.08],
  [[0, 4, 0], 0.05], [[1, 4, 0], 0.03], [[2, 4, 0], 0.02], [[3, 4, 0], 0.02], [[4, 4, 0], 0.03], [[5, 4, 0], 0.08],
  // Weekend nights slightly different
  [[0, 5, 0], 0.08], [[1, 5, 0], 0.06], [[2, 5, 0], 0.04], [[3, 5, 0], 0.03], [[4, 5, 0], 0.03], [[5, 5, 0], 0.06],
  [[0, 6, 0], 0.07], [[1, 6, 0], 0.05], [[2, 6, 0], 0.03], [[3, 6, 0], 0.02], [[4, 6, 0], 0.02], [[5, 6, 0], 0.05],
  
  // Morning rush (6-9): High traffic on weekdays
  [[6, 0, 0], 0.25], [[7, 0, 0], 0.60], [[8, 0, 0], 0.85], [[9, 0, 0], 0.70],
  [[6, 1, 0], 0.25], [[7, 1, 0], 0.60], [[8, 1, 0], 0.85], [[9, 1, 0], 0.70],
  [[6, 2, 0], 0.25], [[7, 2, 0], 0.60], [[8, 2, 0], 0.85], [[9, 2, 0], 0.70],
  [[6, 3, 0], 0.25], [[7, 3, 0], 0.60], [[8, 3, 0], 0.85], [[9, 3, 0], 0.70],
  [[6, 4, 0], 0.25], [[7, 4, 0], 0.60], [[8, 4, 0], 0.85], [[9, 4, 0], 0.70],
  // Weekend mornings - lower traffic
  [[6, 5, 0], 0.10], [[7, 5, 0], 0.15], [[8, 5, 0], 0.25], [[9, 5, 0], 0.35],
  [[6, 6, 0], 0.08], [[7, 6, 0], 0.12], [[8, 6, 0], 0.20], [[9, 6, 0], 0.30],
  
  // Mid-day (10-15): Moderate traffic
  [[10, 0, 0], 0.50], [[11, 0, 0], 0.45], [[12, 0, 0], 0.55], [[13, 0, 0], 0.60], [[14, 0, 0], 0.55], [[15, 0, 0], 0.50],
  [[10, 1, 0], 0.50], [[11, 1, 0], 0.45], [[12, 1, 0], 0.55], [[13, 1, 0], 0.60], [[14, 1, 0], 0.55], [[15, 1, 0], 0.50],
  [[10, 2, 0], 0.50], [[11, 2, 0], 0.45], [[12, 2, 0], 0.55], [[13, 2, 0], 0.60], [[14, 2, 0], 0.55], [[15, 2, 0], 0.50],
  [[10, 3, 0], 0.50], [[11, 3, 0], 0.45], [[12, 3, 0], 0.55], [[13, 3, 0], 0.60], [[14, 3, 0], 0.55], [[15, 3, 0], 0.50],
  [[10, 4, 0], 0.50], [[11, 4, 0], 0.45], [[12, 4, 0], 0.55], [[13, 4, 0], 0.60], [[14, 4, 0], 0.55], [[15, 4, 0], 0.50],
  // Weekend mid-day - slightly higher (leisure travel)
  [[10, 5, 0], 0.45], [[11, 5, 0], 0.55], [[12, 5, 0], 0.60], [[13, 5, 0], 0.65], [[14, 5, 0], 0.60], [[15, 5, 0], 0.55],
  [[10, 6, 0], 0.40], [[11, 6, 0], 0.50], [[12, 6, 0], 0.55], [[13, 6, 0], 0.60], [[14, 6, 0], 0.55], [[15, 6, 0], 0.50],
  
  // Evening rush (16-19): Peak traffic on weekdays
  [[16, 0, 0], 0.65], [[17, 0, 0], 0.90], [[18, 0, 0], 0.95], [[19, 0, 0], 0.75],
  [[16, 1, 0], 0.65], [[17, 1, 0], 0.90], [[18, 1, 0], 0.95], [[19, 1, 0], 0.75],
  [[16, 2, 0], 0.65], [[17, 2, 0], 0.90], [[18, 2, 0], 0.95], [[19, 2, 0], 0.75],
  [[16, 3, 0], 0.65], [[17, 3, 0], 0.90], [[18, 3, 0], 0.95], [[19, 3, 0], 0.75],
  [[16, 4, 0], 0.70], [[17, 4, 0], 0.92], [[18, 4, 0], 0.98], [[19, 4, 0], 0.80], // Friday evening highest
  // Weekend evenings - moderate
  [[16, 5, 0], 0.50], [[17, 5, 0], 0.55], [[18, 5, 0], 0.50], [[19, 5, 0], 0.45],
  [[16, 6, 0], 0.55], [[17, 6, 0], 0.60], [[18, 6, 0], 0.55], [[19, 6, 0], 0.50], // Sunday return traffic
  
  // Late evening (20-23): Declining traffic
  [[20, 0, 0], 0.45], [[21, 0, 0], 0.30], [[22, 0, 0], 0.20], [[23, 0, 0], 0.12],
  [[20, 1, 0], 0.45], [[21, 1, 0], 0.30], [[22, 1, 0], 0.20], [[23, 1, 0], 0.12],
  [[20, 2, 0], 0.45], [[21, 2, 0], 0.30], [[22, 2, 0], 0.20], [[23, 2, 0], 0.12],
  [[20, 3, 0], 0.45], [[21, 3, 0], 0.30], [[22, 3, 0], 0.20], [[23, 3, 0], 0.12],
  [[20, 4, 0], 0.50], [[21, 4, 0], 0.40], [[22, 4, 0], 0.30], [[23, 4, 0], 0.20], // Friday night higher
  [[20, 5, 0], 0.55], [[21, 5, 0], 0.45], [[22, 5, 0], 0.35], [[23, 5, 0], 0.20], // Saturday night
  [[20, 6, 0], 0.40], [[21, 6, 0], 0.25], [[22, 6, 0], 0.15], [[23, 6, 0], 0.10], // Sunday night low
  
  // Rain/Snow patterns (reduces traffic by ~30%)
  [[8, 0, 1], 0.60], [[8, 1, 1], 0.60], [[8, 2, 1], 0.60], [[8, 3, 1], 0.60], [[8, 4, 1], 0.60],
  [[17, 0, 1], 0.65], [[17, 1, 1], 0.65], [[17, 2, 1], 0.65], [[17, 3, 1], 0.65], [[17, 4, 1], 0.65],
  [[18, 0, 1], 0.70], [[18, 1, 1], 0.70], [[18, 2, 1], 0.70], [[18, 3, 1], 0.70], [[18, 4, 1], 0.70],
  [[12, 0, 1], 0.40], [[12, 5, 1], 0.45], [[12, 6, 1], 0.40],
  [[3, 0, 1], 0.01], [[3, 1, 1], 0.01], [[3, 2, 1], 0.01], // Almost no traffic at 3am in rain
];

// Model state
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let model: any = null;
let isTraining = false;
let trainedEpochs = 0;
let lastLoss = 1.0;
let modelReady = false;

// Normalize inputs to 0-1 range
function normalizeInput(hour: number, dayOfWeek: number, isWeather: number): number[] {
  return [
    hour / 23,        // Hour: 0-23 -> 0-1
    dayOfWeek / 6,    // Day: 0-6 -> 0-1
    isWeather         // Already 0 or 1
  ];
}

/**
 * Create the Dense Neural Network model architecture
 * Simplified from LSTM to Dense layers for regression task stability
 */
async function createModel() {
  const tf = await getTf();
  const model = tf.sequential();
  
  // Input layer with 64 neurons
  model.add(tf.layers.dense({
    inputShape: [3],
    units: 64,
    activation: 'relu',
    kernelInitializer: 'glorotUniform'
  }));
  
  // Hidden layer 1
  model.add(tf.layers.dense({
    units: 32,
    activation: 'relu'
  }));
  
  // Dropout for regularization
  model.add(tf.layers.dropout({ rate: 0.2 }));
  
  // Hidden layer 2
  model.add(tf.layers.dense({
    units: 16,
    activation: 'relu'
  }));
  
  // Output layer: single spawn rate prediction
  model.add(tf.layers.dense({
    units: 1,
    activation: 'sigmoid' // Output between 0-1
  }));
  
  // Compile with Adam optimizer
  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'meanSquaredError',
    metrics: ['mse']
  });
  
  return model as any;
}

/**
 * Train the model on historical patterns
 */
export async function trainModel(epochs: number = 100, onProgress?: (epoch: number, loss: number) => void): Promise<void> {
  if (isTraining) {
    console.warn('Model is already training');
    return;
  }
  
  isTraining = true;
  
  try {
    const tf = await getTf();
    
    // Create model if not exists
    if (!model) {
      model = await createModel();
    }
    
    // Prepare training data
    const xs: number[][] = [];
    const ys: number[] = [];
    
    for (const [input, output] of HISTORICAL_PATTERNS) {
      xs.push(normalizeInput(input[0], input[1], input[2]));
      ys.push(output);
    }
    
    // Augment data with noise for better generalization
    const augmentedXs: number[][] = [...xs];
    const augmentedYs: number[] = [...ys];
    
    // Add 3x augmented samples with slight noise
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < xs.length; j++) {
        const noise = () => (Math.random() - 0.5) * 0.05;
        augmentedXs.push([
          Math.max(0, Math.min(1, xs[j][0] + noise())),
          Math.max(0, Math.min(1, xs[j][1] + noise())),
          xs[j][2]
        ]);
        augmentedYs.push(Math.max(0, Math.min(1, ys[j] + noise())));
      }
    }
    
    // Convert to tensors
    const xTensor = tf.tensor2d(augmentedXs);
    const yTensor = tf.tensor2d(augmentedYs, [augmentedYs.length, 1]);
    
    // Train the model
    await model.fit(xTensor, yTensor, {
      epochs,
      batchSize: 32,
      shuffle: true,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch: number, logs: any) => {
          trainedEpochs = epoch + 1;
          lastLoss = logs?.loss ?? lastLoss;
          if (onProgress) {
            onProgress(epoch + 1, logs?.loss ?? 0);
          }
        }
      }
    });
    
    // Cleanup tensors
    xTensor.dispose();
    yTensor.dispose();
    
    modelReady = true;
    console.log(`Neural Network Traffic Predictor trained: ${trainedEpochs} epochs, loss: ${lastLoss.toFixed(6)}`);
    
  } catch (error) {
    console.error('Training failed:', error);
  } finally {
    isTraining = false;
  }
}

/**
 * Predict optimal spawn rate based on current conditions
 */
export function predictSpawnRate(hour: number, dayOfWeek: number, isRainOrSnow: boolean): number {
  if (!model || !modelReady || typeof window === 'undefined' || !tf) {
    // Fallback to simple heuristic if model not ready or running on server
    return getHeuristicSpawnRate(hour, dayOfWeek, isRainOrSnow);
  }
  
  try {
    const input = normalizeInput(hour, dayOfWeek, isRainOrSnow ? 1 : 0);
    const inputTensor = tf.tensor2d([input]);
    const prediction = model.predict(inputTensor);
    const result = prediction.dataSync()[0];
    
    // Cleanup
    inputTensor.dispose();
    prediction.dispose();
    
    return Math.max(0.01, Math.min(1, result));
  } catch (error) {
    console.error('Prediction error:', error);
    return getHeuristicSpawnRate(hour, dayOfWeek, isRainOrSnow);
  }
}

/**
 * Fallback heuristic when model is not ready
 */
function getHeuristicSpawnRate(hour: number, dayOfWeek: number, isRainOrSnow: boolean): number {
  let baseRate = 0.3;
  
  // Time-based adjustments
  if (hour >= 1 && hour <= 4) {
    baseRate = 0.03; // Very low at night
  } else if (hour >= 7 && hour <= 9) {
    baseRate = 0.75; // Morning rush
  } else if (hour >= 17 && hour <= 19) {
    baseRate = 0.85; // Evening rush
  } else if (hour >= 10 && hour <= 16) {
    baseRate = 0.50; // Midday
  } else {
    baseRate = 0.25; // Other times
  }
  
  // Weekend adjustment
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    // Flatten the rush hours on weekends
    if (hour >= 7 && hour <= 9) baseRate *= 0.5;
    if (hour >= 17 && hour <= 19) baseRate *= 0.7;
  }
  
  // Weather reduction
  if (isRainOrSnow) {
    baseRate *= 0.7;
  }
  
  return baseRate;
}

/**
 * Get model status for UI display
 */
export function getModelStatus(): {
  isReady: boolean;
  isTraining: boolean;
  epochs: number;
  loss: number;
  confidence: number;
} {
  // Confidence is inverse of loss, scaled to percentage
  const confidence = modelReady ? Math.min(99, Math.max(50, (1 - lastLoss) * 100)) : 0;
  
  return {
    isReady: modelReady,
    isTraining,
    epochs: trainedEpochs,
    loss: lastLoss,
    confidence
  };
}

/**
 * Get prediction with confidence interval
 */
export function getPredictionWithConfidence(hour: number, dayOfWeek: number, isRainOrSnow: boolean): {
  spawnRate: number;
  confidence: number;
  prediction24h: number[];
} {
  const spawnRate = predictSpawnRate(hour, dayOfWeek, isRainOrSnow);
  const status = getModelStatus();
  
  // Generate 24-hour forecast
  const prediction24h: number[] = [];
  for (let h = 0; h < 24; h++) {
    prediction24h.push(predictSpawnRate(h, dayOfWeek, isRainOrSnow));
  }
  
  return {
    spawnRate,
    confidence: status.confidence,
    prediction24h
  };
}

/**
 * Initialize and train model automatically
 */
export async function initializePredictor(onProgress?: (epoch: number, loss: number) => void): Promise<void> {
  console.log('Initializing Neural Network Traffic Predictor...');
  await trainModel(50, onProgress); // Quick training with 50 epochs
}

/**
 * Dispose model to free memory
 */
export function disposePredictor(): void {
  if (model) {
    model.dispose();
    model = null;
    modelReady = false;
    trainedEpochs = 0;
    lastLoss = 1.0;
  }
}
