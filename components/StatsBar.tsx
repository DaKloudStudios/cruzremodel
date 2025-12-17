import React, { useEffect, useState, useRef } from 'react';
import { StatItem } from '../types';
import { SpotlightParticles } from './SpotlightParticles';

const Counter: React.FC<{ end: number; duration: number; suffix: string }> = ({ end, duration, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const increment = end / (duration / 16); // 60fps
          
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(start);
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span ref={ref} className="font-bold text-3xl md:text-5xl text-navy-900 font-serif tracking-tight">
      {end % 1 !== 0 ? count.toFixed(1) : Math.floor(count)}
      <span className="text-gold-600 ml-1">{suffix}</span>
    </span>
  );
};

export const StatsBar: React.FC = () => {
  const statsData: StatItem[] = [
    { id: 1, label: "Years Experience", value: 12, suffix: '+' },
    { id: 2, label: "Projects Delivered", value: 450, suffix: '+' },
    { id: 3, label: "Serving Bay Area", value: 25, suffix: 'mi' },
    { id: 4, label: "Yelp Rating", value: 5.0, suffix: '★' },
  ];

  return (
    <section className="relative z-30 -mt-12 md:-mt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* White Glass Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6 md:p-12 relative overflow-hidden transition-transform hover:-translate-y-1 duration-500 group">
          
          {/* Internal Particle Spotlight Effect */}
          <SpotlightParticles 
             particleCount={40} 
             baseOpacity={0.01} 
             spotlightOpacity={1.0} 
             range={150}
             className="z-0 mix-blend-multiply"
          />

          {/* Decorative Top Glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-400/50 to-transparent opacity-70 z-10"></div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center divide-x-0 md:divide-x divide-gray-200 relative z-20">
            {statsData.map((stat) => (
              <div key={stat.id} className="flex flex-col items-center justify-center p-2 transition-colors hover:bg-black/5 rounded-lg">
                <Counter end={stat.value} duration={2000} suffix={stat.suffix} />
                <span className="text-gray-700 uppercase tracking-widest text-xs md:text-sm font-bold mt-2 font-sans group-hover:text-gold-700 transition-colors">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};