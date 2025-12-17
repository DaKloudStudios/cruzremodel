import React, { useState, useRef, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import CircularGallery from './CircularGallery';

interface ComparisonProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

// Particle system types
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  color: string;
}

const ComparisonSlider: React.FC<ComparisonProps> = ({ 
  beforeImage, 
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After"
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs for particle system to avoid re-renders and access state inside requestAnimationFrame
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sliderPosRef = useRef(50); 
  const isDraggingRef = useRef(false); // Track dragging state in ref for animation loop
  
  // Sync state with refs
  useEffect(() => {
    sliderPosRef.current = sliderPosition;
  }, [sliderPosition]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  const handleMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let clientX;

    if ('touches' in event) {
      clientX = event.touches[0].clientX;
    } else {
      clientX = (event as React.MouseEvent).clientX;
    }

    const position = ((clientX - containerRect.left) / containerRect.width) * 100;
    const clampedPos = Math.min(Math.max(position, 0), 100);
    setSliderPosition(clampedPos);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  // Global event listeners for smooth dragging outside component
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging) {
         // @ts-ignore
         handleMove(e);
      }
    };
    const handleGlobalUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalUp);
      window.addEventListener('touchmove', handleGlobalMove);
      window.addEventListener('touchend', handleGlobalUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [isDragging]);

  // FAIRY DUST ANIMATION EFFECT
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Single Color Palette: #f1d805
    const colors = [
      '#f1d805'
    ];

    const resize = () => {
      if(containerRef.current && canvas) {
        canvas.width = containerRef.current.offsetWidth;
        canvas.height = containerRef.current.offsetHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();

    const createParticle = (x: number): Particle => {
      const y = Math.random() * canvas.height;
      return {
        x: x + (Math.random() - 0.5) * 10, // Slight scatter around the line
        y: y,
        vx: (Math.random() - 0.5) * 1.5, // Random horizontal drift
        vy: (Math.random() - 0.5) * 1.5, // Random vertical drift
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        life: 1.0,
        color: colors[0]
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Current X position of the slider line
      const lineX = (sliderPosRef.current / 100) * canvas.width;

      // Spawn new particles ONLY if dragging
      if (isDraggingRef.current) {
        // Density: spawn a few particles every frame while dragging
        for (let i = 0; i < 4; i++) {
          particles.push(createParticle(lineX));
        }
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02; // Fade speed
        p.size *= 0.95; // Shrink slightly

        if (p.life > 0 && p.size > 0.1) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * p.life;
          ctx.fill();
          
          if (p.size > 1.5) {
             ctx.shadowBlur = 5;
             ctx.shadowColor = p.color;
          } else {
             ctx.shadowBlur = 0;
          }
        } else {
          particles.splice(i, 1);
          i--;
        }
      }
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // Draw a subtle glow line
      const gradient = ctx.createLinearGradient(lineX, 0, lineX, canvas.height);
      gradient.addColorStop(0, 'rgba(241, 216, 5, 0)');
      gradient.addColorStop(0.5, isDraggingRef.current ? 'rgba(241, 216, 5, 0.5)' : 'rgba(241, 216, 5, 0.1)');
      gradient.addColorStop(1, 'rgba(241, 216, 5, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(lineX - (isDraggingRef.current ? 3 : 1), 0, isDraggingRef.current ? 6 : 2, canvas.height);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[350px] md:h-[600px] overflow-hidden rounded-2xl cursor-col-resize select-none shadow-2xl border-4 border-white group"
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      {/* Background Image (After - Full Width) */}
      <img 
        src={afterImage} 
        alt="After Remodel" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <div className="absolute top-4 right-4 bg-navy-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-10 border border-white/10">
        {afterLabel}
      </div>

      {/* Foreground Image (Before - Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={beforeImage} 
          alt="Before Remodel" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none max-w-none"
          style={{ width: containerRef.current?.offsetWidth || '100%' }}
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-navy-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-10 shadow-sm">
          {beforeLabel}
        </div>
        
        {/* Dark overlay on 'Before' side to make it look distinct */}
        <div className="absolute inset-0 bg-navy-900/20 pointer-events-none"></div>
      </div>

      {/* Magic Dust Canvas Overlay */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-15 mix-blend-screen"
      />

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-20 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 active:scale-95 text-navy-900">
           <ChevronsLeftRight className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>
    </div>
  );
};

export const BeforeAfter: React.FC = () => {
  // DATA: Project Gallery Images with Locations
  const projects = [
    { 
      image: "https://firebasestorage.googleapis.com/v0/b/aivoks-website.firebasestorage.app/o/Chris%2FSlide%20show%2F1.png?alt=media&token=e122c166-50e7-43d8-af97-af714ca13e03", 
      text: "SAN JOSE" 
    },
    { 
      image: "https://firebasestorage.googleapis.com/v0/b/aivoks-website.firebasestorage.app/o/Chris%2FSlide%20show%2F2.png?alt=media&token=6b86135e-77ab-4d04-897e-dcc6f08e8154", 
      text: "FREMONT" 
    },
    { 
      image: "https://firebasestorage.googleapis.com/v0/b/aivoks-website.firebasestorage.app/o/Chris%2FSlide%20show%2F3.png?alt=media&token=5ab8b172-ef44-4fed-a0bb-d0c703e7c553", 
      text: "WILLOW GLEN" 
    },
    { 
      image: "https://firebasestorage.googleapis.com/v0/b/aivoks-website.firebasestorage.app/o/Chris%2FSlide%20show%2F4.png?alt=media&token=f1c1fc37-e8fb-4d4a-b80f-d2e005e7670e", 
      text: "SUNNYVALE" 
    },
    { 
      image: "https://firebasestorage.googleapis.com/v0/b/aivoks-website.firebasestorage.app/o/Chris%2FSlide%20show%2F5.png?alt=media&token=1f33e52a-83a5-496c-9dfa-94effc175619", 
      text: "PALO ALTO" 
    },
    { 
      image: "https://firebasestorage.googleapis.com/v0/b/aivoks-website.firebasestorage.app/o/Chris%2FSlide%20show%2F6.png?alt=media&token=443cbb94-ff89-4b12-9777-18e534a328eb", 
      text: "HAYWARD" 
    },
    { 
      image: "https://firebasestorage.googleapis.com/v0/b/aivoks-website.firebasestorage.app/o/Chris%2FSlide%20show%2F7.png?alt=media&token=2812e395-b9ed-4e0e-8aa2-a96a22eaf2d0", 
      text: "UNION CITY" 
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-transparent relative overflow-hidden">
      
      {/* Top Gradient to fade from the previous section - White */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent z-0 pointer-events-none"></div>

      {/* Ambient Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-gold-400/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
           <span className="text-gold-700 font-bold tracking-widest uppercase text-xs mb-3 block">Real Results</span>
           <h2 className="text-3xl md:text-5xl font-serif font-bold text-navy-900 mb-4">See The Transformation</h2>
           <p className="text-gray-800 max-w-2xl mx-auto font-medium text-sm md:text-base">
             Drag the slider to reveal how we turn outdated spaces into award-winning designs.
           </p>
        </div>

        <RevealOnScroll>
          <div className="max-w-5xl mx-auto flex flex-col gap-16 md:gap-24">
             {/* Comparison 1: Bathroom/Kitchen */}
             <div className="flex flex-col gap-4 md:gap-6">
                <ComparisonSlider 
                  beforeImage="https://storage.googleapis.com/aivoks_website_almacenamiento/cruz%20remodel/antes.png" 
                  afterImage="https://storage.googleapis.com/aivoks_website_almacenamiento/cruz%20remodel/despues.png" 
                  beforeLabel="Before"
                  afterLabel="After"
                />
                <div className="text-center">
                  <h3 className="text-xl md:text-2xl font-serif text-gold-700 font-bold">Modern Luxury Bathroom</h3>
                  <p className="text-gray-800 font-medium text-sm md:text-base">Witness the dramatic difference detailed craftsmanship makes.</p>
                </div>
             </div>

             {/* Comparison 2: Living Room */}
             <div className="flex flex-col gap-4 md:gap-6">
                <ComparisonSlider 
                  beforeImage="https://storage.googleapis.com/aivoks_website_almacenamiento/cruz%20remodel/sala%20vieja.png" 
                  afterImage="https://storage.googleapis.com/aivoks_website_almacenamiento/cruz%20remodel/sala%20nueva.png" 
                  beforeLabel="Before"
                  afterLabel="After"
                />
                <div className="text-center">
                  <h3 className="text-xl md:text-2xl font-serif text-gold-700 font-bold">Living Room Revitalization</h3>
                  <p className="text-gray-800 font-medium text-sm md:text-base">Creating open, inviting spaces for family and entertainment.</p>
                </div>
             </div>
          </div>

          {/* Featured Project Gallery (Circular Slideshow) */}
          <div className="mt-20 md:mt-32 mb-12">
             <div className="text-center mb-8 md:mb-10">
                <div className="w-16 h-1 bg-gold-400 mx-auto mb-6 rounded-full"></div>
                <span className="text-gold-700 font-bold tracking-widest uppercase text-sm mb-2 block">Our Portfolio</span>
                <h3 className="text-2xl md:text-4xl font-serif font-bold text-navy-900">Featured Projects Across The Bay</h3>
                <p className="text-gray-500 mt-2 text-sm italic">Swipe to explore</p>
             </div>
             
             {/* Container Height defines the 3D scene size. Reduced for mobile. */}
             <div className="w-full h-[400px] md:h-[600px] cursor-grab active:cursor-grabbing">
                <CircularGallery 
                  items={projects} 
                  bend={3} 
                  textColor="#09090b" 
                  borderRadius={0.05}
                  font="900 30px 'Inter', sans-serif"
                />
             </div>
          </div>

        </RevealOnScroll>
      </div>

      {/* Bottom Gradient to fade into the next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-0 pointer-events-none"></div>
    </section>
  );
};