import React from 'react';
import { Hero } from './components/Hero';
import { StatsBar } from './components/StatsBar';
import { Process } from './components/Process';
import { Reviews } from './components/Reviews';
import { Team } from './components/Team';
import { Timeline } from './components/Timeline';
import { BeforeAfter } from './components/BeforeAfter';
import { FAQ } from './components/FAQ';
import { SpotlightParticles } from './components/SpotlightParticles';
import { ChatAssistant } from './components/ChatAssistant';

const FooterContent = () => {
  return (
    <footer className="relative z-10 bg-navy-950 text-white py-16 border-t border-white/5 overflow-hidden">
        {/* Footer Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-navy-900 via-black to-black opacity-80 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h3 className="text-2xl font-serif font-bold text-gold-400 mb-6">Cruz Remodel</h3>
          <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto">
            Transforming homes and lifestyles in the Bay Area.<br/>
            We appreciate your trust.
          </p>
          <div className="mt-12 pt-8 border-t border-white/10 text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Cruz Remodel. All rights reserved.
          </div>
        </div>
      </footer>
  );
}

function App() {
  return (
    <main className="min-h-screen bg-white font-sans text-navy-900 selection:bg-gold-500/30 selection:text-navy-900 overflow-x-hidden relative">
      
      {/* GLOBAL BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Noise Texture */}
        <div className="absolute inset-0 bg-noise opacity-30 mix-blend-multiply"></div>
        
        {/* Spotlight Particles - Global effect for solid areas */}
        <SpotlightParticles 
          particleCount={150}
          baseOpacity={0.0} // Completely invisible when idle
          spotlightOpacity={0.6} // Glows when hovered
          range={300}
        />
      </div>

      <div className="relative z-10">
        <Hero />
        <StatsBar />
        
        {/* Results First: Show them what we can do */}
        <BeforeAfter />

        {/* Social Proof */}
        <Reviews />
        
        <Process />
        <Timeline />
        <Team />
        
        {/* Answer Objections before Footer */}
        <FAQ />
      </div>
      
      {/* Floating Elements */}
      <ChatAssistant />
      
      <FooterContent />
    </main>
  );
}

export default App;