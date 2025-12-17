import React, { useRef, useState } from 'react';
import { Play, Loader2, ChevronDown, Instagram, Globe } from 'lucide-react';
import RotatingText from './RotatingText';
import Iridescence from './Iridescence';

export const Hero: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // High-end remodeling video or placeholder
  const primaryVideoUrl = "https://firebasestorage.googleapis.com/v0/b/aivoks-website.firebasestorage.app/o/Chris%2FThis%20is%20the%20most%20important%20question%2C%20isn't%20it.mp4?alt=media&token=464f518b-6c5e-4d27-a231-7087e230eb34";
  const fallbackVideoUrl = "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4";
  
  // Cover Images
  const frontCoverUrl = "https://firebasestorage.googleapis.com/v0/b/aivoks-website.firebasestorage.app/o/Chris%2Ffront.png?alt=media&token=9e4bd171-bc92-4403-adff-7edd032cb962";
  const backCoverUrl = "https://firebasestorage.googleapis.com/v0/b/aivoks-website.firebasestorage.app/o/Chris%2Fback.png?alt=media&token=99f99487-b1c5-435f-954d-acee06b014e1";

  const [videoSource, setVideoSource] = useState(primaryVideoUrl);
  const [usingFallback, setUsingFallback] = useState(false);
  
  const subtitleText = "Bay Area's trusted choice for luxury kitchens, bathrooms, and complete home renovations.";

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    if (!usingFallback) {
      console.log("Video failed, switching to fallback...");
      setUsingFallback(true);
      setVideoSource(fallbackVideoUrl);
      if(videoRef.current) {
        videoRef.current.load();
      }
    } else {
      setVideoLoaded(true); 
    }
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  const handlePlayButton = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section className="relative min-h-[90vh] md:min-h-screen w-full flex flex-col items-center justify-start md:justify-center bg-white px-4 pt-4 md:pt-24 pb-12 md:pb-20 overflow-hidden">
      
      <style>{`
        @keyframes typingReveal {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Dynamic Background Layer (Liquid Yellow Effect) */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-80">
        <Iridescence
          color={[0.945, 0.847, 0.02]} 
          mouseReact={true}
          amplitude={0.2} 
          speed={1.0} 
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
      </div>
      
      {/* Main Text Content */}
      <div className="relative z-10 text-center mb-1 max-w-5xl px-4 animate-fadeIn mt-4 md:mt-0 flex flex-col items-center">
         <h1 className="font-serif font-bold text-navy-900 mb-0 leading-tight tracking-tight flex flex-col items-center justify-center gap-y-2 md:gap-y-4">
           
           <span 
             className="whitespace-nowrap text-5xl sm:text-7xl md:text-8xl lg:text-9xl pb-2 tracking-tighter block relative z-10"
             style={{
               fontFamily: '"Arial Rounded MT Bold", "Helvetica Rounded", Arial, sans-serif',
               color: '#ffffff',
               WebkitTextStroke: '4px black',
               paintOrder: 'stroke fill',
               textShadow: '4px 4px 0px rgba(0,0,0,0.15)'
             }}
           >
             CruzRemodel
           </span>
           
           <RotatingText
              texts={["redefining quality.", "transforming homes.", "building your dream."]}
              mainClassName="text-2xl sm:text-3xl md:text-5xl lg:text-6xl px-6 sm:px-10 py-3 sm:py-5 bg-white text-navy-950 border-2 border-solid border-gold-400 rounded-full inline-flex overflow-hidden justify-center items-center shadow-xl text-center mt-2 font-bold tracking-wide backdrop-blur-sm hover:scale-105 transition-transform duration-300 relative z-20"
              staggerFrom="last"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-120%", opacity: 0 }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden py-0.5 sm:py-1 md:py-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={3000}
            />
         </h1>
         
         <p 
           className="text-white text-2xl md:text-4xl max-w-4xl mx-auto font-semibold leading-relaxed px-4 mt-4"
           aria-label={subtitleText}
           style={{
             textShadow: '0 2px 10px rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.1)',
             WebkitTextStroke: '1.5px black',
             paintOrder: 'stroke fill'
           }}
         >
           {subtitleText.split('').map((char, index) => (
             <span
               key={index}
               aria-hidden="true"
               style={{
                 opacity: 0,
                 animation: `typingReveal 0.01s forwards ${index * 0.03}s`
               }}
             >
               {char}
             </span>
           ))}
         </p>
      </div>

      {/* Centered Video Container with Static Layered Cover */}
      {/* Reduced margins to bring video closer to text box */}
      <div 
        className="relative w-full max-w-5xl aspect-video bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200 group transform transition-all duration-500 hover:scale-[1.005] mt-2"
      >
        
        {/* === STATIC LAYERED COVER SYSTEM (Visible when NOT playing) === */}
        {!isPlaying && (
          <>
             {/* 1. BACK LAYER (Z-10) */}
             <div className="absolute inset-0 z-10 overflow-hidden rounded-2xl bg-gray-100">
               <img 
                 src={backCoverUrl} 
                 className="w-full h-full object-cover"
                 alt="Background Cover"
               />
               {/* Overlay to ensure button pops */}
               <div className="absolute inset-0 bg-black/10"></div>
             </div>

             {/* 2. BUTTON LAYER (Z-20) */}
             {/* Changed: Positioned to middle-lower area using center alignment + top padding to hit 'palms' location */}
             <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none pt-32 md:pt-48">
                <button 
                  onClick={handlePlayButton}
                  className="pointer-events-auto group relative inline-flex items-center gap-3 md:gap-4 px-6 md:px-8 py-3 md:py-4 bg-white/90 border-2 border-gold-400 hover:bg-white rounded-full transition-all duration-300 backdrop-blur-md hover:scale-105 shadow-2xl max-w-[90%]"
                >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                      <Play className="w-4 h-4 md:w-5 md:h-5 fill-navy-950 text-navy-950 ml-1" />
                    </div>
                    <span className="text-lg md:text-xl font-serif italic text-navy-950 group-hover:text-gold-700 transition-colors font-bold">
                      Why should you trust us?
                    </span>
                </button>
             </div>

             {/* 3. FRONT LAYER (Z-30) */}
             <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-2xl">
               <img 
                 src={frontCoverUrl} 
                 className="w-full h-full object-cover"
                 alt="Foreground Cover"
               />
             </div>
          </>
        )}

        {/* Video Player (Visible when playing or loading behind cover) */}
        {!videoLoaded && isPlaying && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
          </div>
        )}

        <video
          ref={videoRef}
          className={`w-full h-full object-cover bg-black ${isPlaying ? 'relative z-40' : 'absolute inset-0 z-0'}`}
          playsInline
          controls={false}
          preload="metadata"
          onLoadedData={handleVideoLoad} 
          onError={handleVideoError}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        >
          <source src={videoSource} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 flex flex-row items-center justify-center gap-4 sm:gap-6 mt-5 w-full px-4">
        <a 
          href="https://www.instagram.com/cruzremodel.official/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 px-5 sm:px-8 py-4 bg-white border-2 border-gold-400 rounded-full text-navy-900 font-bold transition-all duration-300 hover:bg-gray-50 hover:scale-105 shadow-md hover:shadow-xl group min-w-[140px]"
        >
          <Instagram className="w-6 h-6 group-hover:scale-110 transition-transform text-pink-600 shrink-0" />
          <span className="text-lg sm:text-xl">INSTAGRAM</span>
        </a>
        
        <a 
          href="https://www.cruzremodel.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 px-5 sm:px-8 py-4 bg-white border-2 border-gold-400 rounded-full text-black font-bold transition-all duration-300 hover:bg-gray-50 hover:scale-105 shadow-md hover:shadow-xl group min-w-[140px]"
        >
          <Globe className="w-6 h-6 group-hover:scale-110 transition-transform text-blue-600 shrink-0" />
          <span className="text-lg sm:text-xl">WEBSITE</span>
        </a>
      </div>

      {/* Scroll Indicator */}
      <div className="relative mt-8 md:mt-12 flex flex-col items-center justify-center gap-2 opacity-60 animate-bounce z-20 pointer-events-none">
        <span className="text-sm md:text-base text-navy-900 tracking-widest uppercase text-center font-bold">Scroll to learn more</span>
        <ChevronDown className="w-6 h-6 text-navy-900" />
      </div>

    </section>
  );
};