'use client';

import { useEffect, useRef } from 'react';
import { useSimulationStore } from '@/lib/store';

interface Particle {
  x: number;
  y: number;
  speed: number;
  color: string;
  length?: number;
  width?: number;
  radius?: number;
  drift?: number;
}

/**
 * WeatherOverlay Component - Particle Effects System
 * Rain: Fast-falling blue lines, intensity scales with wind
 * Snow: Slow-falling white circles, wind causes drift and density
 * Clear: No overlay
 */
export const WeatherOverlay = () => {
  const { env } = useSimulationStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || env.weather === 'CLEAR') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Wind intensity factor (0-30 range mapped to multiplier)
    const windFactor = Math.max(0.5, env.windSpeed / 15); // 0.5x at calm, 2x at 30 m/s

    // Initialize particles based on weather type — count scales with wind
    const initializeParticles = () => {
      particlesRef.current = [];
      const baseCount = env.weather === 'RAIN' ? 100 : 50;
      const particleCount = Math.round(baseCount * Math.min(2, windFactor));

      for (let i = 0; i < particleCount; i++) {
        if (env.weather === 'RAIN') {
          // Rain: Fast-falling blue lines — wind increases speed and angle
          particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: 12 + Math.random() * 12 + env.windSpeed * 0.3,
            width: 1 + (env.windSpeed > 20 ? 1 : 0), // Heavier rain lines in high wind
            speed: 7 + Math.random() * 5 + env.windSpeed * 0.2,
            color: `rgba(96, 165, 250, ${0.5 + Math.random() * 0.4})`,
          });
        } else if (env.weather === 'SNOW') {
          // Snow: Slow-falling white circles — wind increases drift
          particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 2 + Math.random() * 4,
            speed: 0.4 + Math.random() * 1.2 + env.windSpeed * 0.05,
            drift: (Math.random() - 0.3) * (0.5 + env.windSpeed * 0.08), // Wind pushes snow sideways
            color: `rgba(255, 255, 255, ${0.35 + Math.random() * 0.45})`,
          });
        }
      }
    };

    initializeParticles();

    // Animation loop
    const animate = () => {
      // Clear canvas fully to prevent darkening accumulation
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        if (env.weather === 'RAIN') {
          // Draw rain (diagonal lines — angle increases with wind)
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = particle.width || 1;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          // Wind pushes rain sideways: more wind = more horizontal angle
          const rainAngle = 3 + env.windSpeed * 0.3;
          ctx.lineTo(particle.x + rainAngle, particle.y + (particle.length || 10));
          ctx.stroke();

          // Update position
          particle.y += particle.speed;
          particle.x += 1.5 + env.windSpeed * 0.15; // Wind-driven horizontal drift

          // Respawn if off-screen
          if (particle.y > canvas.height) {
            particle.y = -(particle.length || 10);
            particle.x = Math.random() * canvas.width;
          }
        } else if (env.weather === 'SNOW') {
          // Draw snow (circles)
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius || 2, 0, Math.PI * 2);
          ctx.fill();

          // Update position
          particle.y += particle.speed;
          particle.x += (particle.drift || 0);

          // Respawn if off-screen
          if (particle.y > canvas.height) {
            particle.y = -(particle.radius || 2);
            particle.x = Math.random() * canvas.width;
          }
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [env.weather, env.windSpeed]);

  if (env.weather === 'CLEAR') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-30 pointer-events-none w-full h-full"
    />
  );
};
