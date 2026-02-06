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
 * Rain: Fast-falling blue lines
 * Snow: Slow-falling white circles
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

    // Initialize particles based on weather type
    const initializeParticles = () => {
      particlesRef.current = [];
      const particleCount = env.weather === 'RAIN' ? 100 : 50;

      for (let i = 0; i < particleCount; i++) {
        if (env.weather === 'RAIN') {
          // Rain: Fast-falling blue lines
          particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            length: 15 + Math.random() * 10,
            width: 1,
            speed: 8 + Math.random() * 4,
            color: `rgba(96, 165, 250, ${0.6 + Math.random() * 0.4})`, // Blue with opacity variance
          });
        } else if (env.weather === 'SNOW') {
          // Snow: Slow-falling white circles
          particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            radius: 2 + Math.random() * 4,
            speed: 0.5 + Math.random() * 1.5,
            drift: (Math.random() - 0.5) * 0.5,
            color: `rgba(255, 255, 255, ${0.4 + Math.random() * 0.4})`, // White with opacity variance
          });
        }
      }
    };

    initializeParticles();

    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        if (env.weather === 'RAIN') {
          // Draw rain (diagonal lines)
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = particle.width || 1;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x + 5, particle.y + (particle.length || 10));
          ctx.stroke();

          // Update position
          particle.y += particle.speed;
          particle.x += 2; // Slight horizontal drift

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
  }, [env.weather]);

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
