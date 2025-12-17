import React from 'react';
import { MessageSquare, Settings, HeartHandshake } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import ScrollFloat from './ScrollFloat';
import { BlueprintGrid } from './BlueprintGrid';

export const Process: React.FC = () => {
  const steps = [
    {
      icon: <MessageSquare className="w-8 h-8 text-gold-600" />,
      title: "The Walkthrough",
      desc: "We listen to your vision, measure the space, and understand your lifestyle needs to create a perfect plan."
    },
    {
      icon: <Settings className="w-8 h-8 text-gold-600" />,
      title: "Strategic Design",
      desc: "Our team drafts a comprehensive roadmap, balancing aesthetics with functionality and budget."
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-gold-600" />,
      title: "Flawless Execution",
      desc: "We bring the vision to life with precision, keeping you informed at every milestone until handover."
    }
  ];

  return (
    <section className="py-24 bg-transparent relative overflow-hidden">
      
      {/* Top Fade to blend from Reviews */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>

      {/* Architectural Background */}
      <div className="absolute inset-0 z-0 opacity-20">
         <BlueprintGrid />
      </div>
      
      {/* Light Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#ffffff_90%)] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <span className="text-gold-700 font-bold tracking-widest uppercase text-sm mb-3 block">Our Method</span>
          <ScrollFloat 
            animationDuration={1} 
            ease="back.out(2)" 
            scrollStart="top 80%" 
            containerClassName="mb-4"
            textClassName="text-3xl md:text-5xl font-serif font-bold text-navy-900"
          >
            How We Work
          </ScrollFloat>
          <p className="text-gray-800 text-xl leading-relaxed font-medium">
            A transparent, three-step journey from concept to reality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) - Dark gray for white theme */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-300 -z-10"></div>

          {steps.map((step, index) => (
            <RevealOnScroll key={index} delay={index * 200} className="relative group">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl transition-all duration-500 hover:shadow-[0_0_35px_rgba(212,175,55,0.15)] hover:border-gold-400/30 hover:-translate-y-2 relative z-10 group">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gold-500 group-hover:scale-110 transition-all duration-300 shadow-sm border border-gray-200">
                  {React.cloneElement(step.icon as React.ReactElement<{ className?: string }>, { className: "w-8 h-8 text-gold-700 group-hover:text-white transition-colors" })}
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-4 font-serif">{step.title}</h3>
                <p className="text-gray-700 leading-relaxed text-base group-hover:text-navy-800 transition-colors font-medium">{step.desc}</p>
                
                {/* Background Number */}
                <div className="absolute top-4 right-4 text-6xl font-serif font-bold text-gray-200 group-hover:text-gold-500/10 transition-all duration-500 select-none group-hover:scale-110 group-hover:rotate-3 origin-center">
                  0{index + 1}
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
      
      {/* Bottom Fade to blend into Timeline */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
    </section>
  );
};