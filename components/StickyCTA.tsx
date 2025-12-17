import React, { useEffect, useState } from 'react';
import { LayoutGrid } from 'lucide-react';

export const StickyCTA: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div 
      className={`fixed bottom-8 right-8 z-50 transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
      }`}
    >
      <a 
        href="https://www.cruzremodel.com" 
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-3 bg-navy-900 hover:bg-navy-800 text-white pl-6 pr-8 py-4 rounded-full shadow-2xl border border-white/10 hover:border-gold-400/50 transition-all duration-300 hover:-translate-y-1"
      >
        <div className="relative">
          <span className="absolute -inset-1 rounded-full bg-gold-400 opacity-75 group-hover:animate-ping"></span>
          <LayoutGrid className="w-5 h-5 text-gold-400 relative z-10" />
        </div>
        <div className="flex flex-col items-start">
           <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Ready to start?</span>
           <span className="font-bold text-lg leading-none">Visit Website</span>
        </div>
      </a>
    </div>
  );
};