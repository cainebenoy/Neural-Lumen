'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSimulationStore } from '@/lib/store';

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  layer: number;
}

interface Snowflake {
  x: number;
  y: number;
  speed: number;
  radius: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
  layer: number;
}

interface Splash {
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

/**
 * WeatherOverlay Component - Advanced Particle Effects System
 * Rain: Multi-layer depth, wind-driven angle, splash effects, motion blur
 * Snow: Parallax layers, gentle wobble, soft glow, wind drift with turbulence
 */
export const WeatherOverlay = () => {
  const weather = useSimulationStore((state) => state.env.weather);
  const windSpeed = useSimulationStore((state) => state.env.windSpeed);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rainRef = useRef<RainDrop[]>([]);
  const snowRef = useRef<Snowflake[]>([]);
  const splashesRef = useRef<Splash[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const initializedRef = useRef<string | null>(null);

  // Initialize particles
  const initializeParticles = useCallback((width: number, height: number, type: string, wind: number) => {
    const windFactor = wind / 50;
    
    if (type === 'RAIN') {
      rainRef.current = [];
      splashesRef.current = [];
      
      const layers = [
        { count: 50, speedBase: 10, lengthBase: 10, opacityBase: 0.25 },
        { count: 80, speedBase: 16, lengthBase: 18, opacityBase: 0.45 },
        { count: 60 + Math.floor(windFactor * 40), speedBase: 24, lengthBase: 28, opacityBase: 0.65 },
      ];

      layers.forEach((layer, layerIndex) => {
        for (let i = 0; i < layer.count; i++) {
          rainRef.current.push({
            x: Math.random() * width * 2 - width * 0.5,
            y: Math.random() * height * 1.5 - height * 0.5,
            speed: layer.speedBase + Math.random() * 8,
            length: layer.lengthBase + Math.random() * 10,
            opacity: layer.opacityBase + Math.random() * 0.15,
            layer: layerIndex,
          });
        }
      });
    } else if (type === 'SNOW') {
      snowRef.current = [];
      
      const layers = [
        { count: 40, radiusBase: 1.5, speedBase: 0.4, opacityBase: 0.35 },
        { count: 60, radiusBase: 3, speedBase: 0.7, opacityBase: 0.55 },
        { count: 50, radiusBase: 5, speedBase: 1.2, opacityBase: 0.75 },
      ];

      layers.forEach((layer, layerIndex) => {
        for (let i = 0; i < layer.count; i++) {
          snowRef.current.push({
            x: Math.random() * width,
            y: Math.random() * height,
            speed: layer.speedBase + Math.random() * 0.4,
            radius: layer.radiusBase + Math.random() * 1.5,
            opacity: layer.opacityBase + Math.random() * 0.15,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.015 + Math.random() * 0.025,
            layer: layerIndex,
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || weather === 'CLEAR') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Resize handler
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimensionsRef.current = { width: rect.width, height: rect.height };
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const { width, height } = dimensionsRef.current;

    // Initialize if weather type changed
    if (initializedRef.current !== weather) {
      initializeParticles(width, height, weather, windSpeed);
      initializedRef.current = weather;
    }

    // Animation loop - reads current windSpeed via closure over windSpeed prop
    const animate = () => {
      const { width: w, height: h } = dimensionsRef.current;
      if (w === 0 || h === 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      timeRef.current += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Current wind factor (read fresh each frame)
      const currentWindFactor = windSpeed / 50;

      if (weather === 'RAIN') {
        // Sort by layer for proper depth
        const sortedRain = [...rainRef.current].sort((a, b) => a.layer - b.layer);

        sortedRain.forEach((drop) => {
          const layerScale = 0.5 + drop.layer * 0.25;
          const effectiveLength = drop.length * layerScale;
          
          // Wind-driven horizontal movement (same logic as snow)
          // Base horizontal drift scales with wind and layer depth
          const windDriftX = currentWindFactor * (0.8 + drop.layer * 0.4);
          
          // Turbulence effect (same as snow but faster frequency for rain)
          const turbX = Math.sin(timeRef.current * 2.5 + drop.y * 0.01) * currentWindFactor * 0.3;
          
          // Calculate rain angle based on wind (more wind = more diagonal)
          // At 0 wind: nearly vertical. At max wind: ~45 degrees
          const angleRadians = Math.atan2(currentWindFactor * 0.8, 1);
          const dx = Math.sin(angleRadians);
          const dy = Math.cos(angleRadians);
          
          // Calculate end points for the rain streak
          const endX = drop.x + dx * effectiveLength;
          const endY = drop.y + dy * effectiveLength;

          // Motion blur gradient
          const gradient = ctx.createLinearGradient(drop.x, drop.y, endX, endY);
          const hue = 205 + drop.layer * 8;
          const sat = 60 + drop.layer * 10;
          const light = 65 + drop.layer * 8;
          gradient.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, 0)`);
          gradient.addColorStop(0.2, `hsla(${hue}, ${sat}%, ${light}%, ${drop.opacity * 0.4})`);
          gradient.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, ${drop.opacity})`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1 + drop.layer * 0.4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Update position - same wind logic as snow
          drop.y += drop.speed;
          drop.x += windDriftX + turbX;

          // Respawn when off screen (same logic as snow)
          if (drop.y > h + 20) {
            drop.y = -drop.length - Math.random() * 50;
            drop.x = Math.random() * w;
            
            // Splash effect for front layer
            if (drop.layer === 2 && Math.random() > 0.6) {
              splashesRef.current.push({
                x: drop.x,
                y: h - 3,
                radius: 1,
                opacity: 0.5 + Math.random() * 0.2,
              });
            }
          }
          // Wrap around edges (same as snow)
          if (drop.x > w + 30) {
            drop.x = -20;
          }
          if (drop.x < -30) {
            drop.x = w + 20;
          }
        });

        // Update and draw splashes
        splashesRef.current = splashesRef.current.filter((splash) => {
          splash.radius += 1.2;
          splash.opacity -= 0.06;

          if (splash.opacity <= 0 || splash.radius > 12) return false;

          ctx.strokeStyle = `rgba(160, 200, 255, ${splash.opacity})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(splash.x, splash.y, splash.radius, splash.radius * 0.3, 0, Math.PI, 0);
          ctx.stroke();

          return true;
        });

        // Rain mist at ground level
        const mistGradient = ctx.createLinearGradient(0, h - 80, 0, h);
        mistGradient.addColorStop(0, 'rgba(120, 160, 200, 0)');
        mistGradient.addColorStop(1, `rgba(120, 160, 200, ${0.04 + currentWindFactor * 0.02})`);
        ctx.fillStyle = mistGradient;
        ctx.fillRect(0, h - 80, w, 80);

      } else if (weather === 'SNOW') {
        // Ambient cold tint
        ctx.fillStyle = 'rgba(200, 220, 255, 0.015)';
        ctx.fillRect(0, 0, w, h);

        // Sort by layer
        const sortedSnow = [...snowRef.current].sort((a, b) => a.layer - b.layer);

        sortedSnow.forEach((flake) => {
          const layerScale = 0.6 + flake.layer * 0.2;
          
          // Wobble animation
          flake.wobble += flake.wobbleSpeed;
          const wobbleAmount = Math.sin(flake.wobble) * (1.5 + flake.layer);
          
          // Turbulence based on position and time
          const turbX = Math.sin(timeRef.current * 1.5 + flake.y * 0.008) * currentWindFactor * 0.4;
          const turbY = Math.cos(timeRef.current * 0.8 + flake.x * 0.005) * 0.15;

          const effectiveRadius = flake.radius * layerScale;

          // Soft outer glow
          const glowRadius = effectiveRadius * 3;
          const glowGradient = ctx.createRadialGradient(
            flake.x, flake.y, 0,
            flake.x, flake.y, glowRadius
          );
          glowGradient.addColorStop(0, `rgba(255, 255, 255, ${flake.opacity * 0.7})`);
          glowGradient.addColorStop(0.3, `rgba(230, 245, 255, ${flake.opacity * 0.25})`);
          glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();

          // Core snowflake
          ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
          ctx.shadowBlur = 3;
          ctx.beginPath();
          ctx.arc(flake.x, flake.y, effectiveRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Update position
          flake.y += flake.speed + turbY;
          flake.x += wobbleAmount * 0.25 + currentWindFactor * (0.8 + flake.layer * 0.4) + turbX;

          // Respawn
          if (flake.y > h + flake.radius * 2) {
            flake.y = -flake.radius * 3;
            flake.x = Math.random() * w;
            flake.wobble = Math.random() * Math.PI * 2;
          }
          if (flake.x > w + 30) {
            flake.x = -20;
          }
          if (flake.x < -30) {
            flake.x = w + 20;
          }
        });

        // Snow accumulation at bottom
        const snowGradient = ctx.createLinearGradient(0, h - 40, 0, h);
        snowGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        snowGradient.addColorStop(0.6, 'rgba(245, 250, 255, 0.08)');
        snowGradient.addColorStop(1, 'rgba(255, 255, 255, 0.12)');
        ctx.fillStyle = snowGradient;
        ctx.fillRect(0, h - 40, w, 40);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [weather, windSpeed, initializeParticles]);

  if (weather === 'CLEAR') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-30 pointer-events-none w-full h-full"
      style={{ 
        mixBlendMode: weather === 'SNOW' ? 'screen' : 'normal',
        willChange: 'contents',
      }}
    />
  );
};
