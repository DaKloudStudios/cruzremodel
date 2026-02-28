import React from 'react';
import { TimelineEvent } from '../types';
import { RevealOnScroll } from './RevealOnScroll';

export const Timeline: React.FC = () => {
  const history: TimelineEvent[] = [
    { year: '2019', title: "The Beginning", description: "Founded in a small garage with a vision to change the industry standard for client service." },
    { year: '2021', title: "Rapid Expansion", description: "Moved to our first headquarters and grew the team to 15 passionate experts." },
    { year: '2022', title: "National Recognition", description: "Awarded 'Best New Agency' and expanded our services to include comprehensive consulting." },
    { year: '2024', title: "Innovation Lead", description: "Launched our proprietary tech platform that now powers results for 500+ clients." },
  ];

  return (
    <section className="py-16 md:py-20 bg-transparent overflow-hidden relative">
      {/* Subtle Pattern (Darker dots for white bg) */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      {/* Fading Gradients to White */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-transparent to-white/0"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12 md:mb-16">
           <span className="text-gold-700 font-bold tracking-widest uppercase text-sm mb-2 block">History</span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-navy-900">Our Journey</h2>
        </div>

        {/* Vertical Line - Gold Gradient */}
        <div className="absolute left-4 md:left-1/2 top-32 bottom-20 w-px bg-gradient-to-b from-transparent via-gold-400/50 to-transparent transform md:-translate-x-1/2"></div>

        <div className="space-y-12">
          {history.map((event, index) => (
            <RevealOnScroll key={index} className="relative flex flex-col md:flex-row items-center justify-between group">
               
              {/* Year Bubble */}
              {/* On mobile, left-4 (1rem=16px) is center of line. Bubble width 20px (w-5). Center 10px. Translate X -50% (-10px).
                  Left: 16px - 10px = 6px. Center of bubble = 16px. Perfect alignment. */}
              <div className="absolute left-4 md:left-1/2 w-5 h-5 rounded-full bg-white border-[3px] border-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.4)] transform -translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-150 group-hover:border-navy-900"></div>

              {/* Content Box */}
              <div className={`w-full md:w-5/12 pl-12 md:pl-0 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:order-last md:pl-16 md:text-left'}`}>
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 hover:border-gold-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                  <span className="inline-block text-5xl font-serif font-bold text-gray-100 absolute top-4 right-4 md:right-auto md:left-4 select-none pointer-events-none -z-10 group-hover:text-gold-500/10 transition-colors">
                    {event.year}
                  </span>
                  <span className="inline-block px-4 py-1.5 bg-gray-100 text-gold-700 text-xs md:text-sm font-bold rounded-full mb-3 border border-gray-200">
                    {event.year}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-navy-900 mb-2 font-serif">{event.title}</h3>
                  <p className="text-gray-800 text-sm md:text-base leading-relaxed font-medium">{event.description}</p>
                </div>
              </div>
              
              {/* Empty Spacer */}
              <div className="hidden md:block w-5/12"></div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
};