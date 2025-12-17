import React, { useEffect, useRef } from 'react';

interface SpotlightParticlesProps {
  className?: string;
  particleCount?: number;
  baseOpacity?: number; // Opacity when not hovered
  spotlightOpacity?: number; // Opacity when hovered
  range?: number; // Radius of the spotlight
  speed?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export const SpotlightParticles: React.FC<SpotlightParticlesProps> = ({
  className = '',
  particleCount = 100,
  baseOpacity = 0.0, // Default to invisible unless hovered
  spotlightOpacity = 0.8, // Bright when hovered
  range = 250, // Spotlight radius
  speed = 0.5
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 }); // Start off-screen

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    let height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;

    const particles: Particle[] = [];
    
    // Single Color: #f1d805
    const colors = [
      'rgb(241, 216, 5)', // #f1d805
    ];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() * 1.5 + 0.5, // Variable size
        color: colors[0]
      });
    }

    const onResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    const onMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to canvas
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    // Support for mobile touch "flashlight" effect
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        };
      }
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);

    let frameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce/Wrap
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Interaction Logic
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let alpha = baseOpacity;

        // If within spotlight range, increase opacity based on proximity
        if (dist < range) {
           const factor = 1 - dist / range;
           // Ease out the factor for smoother light falloff
           alpha += factor * (spotlightOpacity - baseOpacity);
        }

        if (alpha > 0.01) { // Only draw if visible enough
            // Apply the alpha to the particle's specific color
            const colorWithAlpha = p.color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
            
            ctx.fillStyle = colorWithAlpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
      });

      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      cancelAnimationFrame(frameId);
    };
  }, [particleCount, baseOpacity, spotlightOpacity, range, speed]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`block pointer-events-none absolute inset-0 w-full h-full ${className}`}
    />
  );
};