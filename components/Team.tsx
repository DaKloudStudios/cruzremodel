import React from 'react';
import { RevealOnScroll } from './RevealOnScroll';
import { Quote } from 'lucide-react';

export const Team: React.FC = () => {
  return (
    <section className="py-20 bg-transparent relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold-100/30 to-transparent pointer-events-none"></div>
      
      {/* Ambient Light */}
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-gold-400/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-navy-900">Meet The Founder</h2>
          <p className="text-gray-800 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Leadership driven by a passion for excellence and a commitment to your vision.
          </p>
        </div>

        <RevealOnScroll>
          <div className="flex flex-col md:flex-row items-center gap-12 bg-white/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:border-gold-400/30 group">
            
            {/* CEO Image */}
            <div className="w-full md:w-5/12 relative">
              <div className="absolute inset-0 bg-gold-400 rounded-2xl transform rotate-3 transition-transform group-hover:rotate-6 opacity-20"></div>
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-lg border-2 border-white">
                <img 
                  src="https://firebasestorage.googleapis.com/v0/b/aivoks-website.firebasestorage.app/o/Chris%2FGemini_Generated_Image_v6emjrv6emjrv6em.png?alt=media&token=a5a3c7f7-e292-4146-a089-17b6015fbb8d" 
                  alt="Christian Cruz" 
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Content */}
            <div className="w-full md:w-7/12 space-y-8">
              <div>
                <span className="inline-block px-4 py-1.5 bg-gold-100 text-gold-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4 border border-gold-200">
                  Founder & CEO
                </span>
                <h3 className="text-4xl md:text-5xl font-serif font-bold text-navy-900 mb-4">Christian Cruz</h3>
                <div className="w-24 h-1.5 bg-gradient-to-r from-gold-400 to-transparent rounded-full"></div>
              </div>

              <blockquote className="relative">
                <Quote className="absolute -top-6 -left-2 w-10 h-10 text-gold-200/50 transform -scale-x-100" />
                <p className="text-gray-700 text-xl leading-relaxed italic relative z-10 font-serif">
                   "We don't just remodel homes; we reimagine lifestyles. Every project is a personal promise of quality."
                </p>
              </blockquote>

              <p className="text-gray-800 leading-relaxed font-medium text-lg">
                With over a decade of experience in high-end construction, Christian established Cruz Remodel to bring a higher standard of transparency and craftsmanship to Bay Area homeowners.
              </p>
              
              <div className="pt-4 flex items-center gap-4">
                 <div className="h-px flex-1 bg-gray-200"></div>
                 <span className="text-sm font-bold text-gold-600 uppercase tracking-widest">Cruz Remodel</span>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};