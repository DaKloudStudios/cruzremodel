import React, { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollFloatProps {
  children: string;
  scrollContainerRef?: React.RefObject<HTMLElement>;
  containerClassName?: string;
  textClassName?: string;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
}

const ScrollFloat: React.FC<ScrollFloatProps> = ({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  // Changed default ease to power4.out for a smoother, premium reveal that doesn't "bounce" against the scroll
  ease = 'power4.out', 
  // Adjusted defaults to ensure it triggers while visible on screen
  scrollStart = 'top 85%',
  scrollEnd = 'bottom 50%',
  stagger = 0.05 // Slightly increased stagger for more wave effect
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split('').map((char, index) => (
      <span className="char inline-block" key={index}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;
    const charElements = el.querySelectorAll('.char');

    // Kill any existing ScrollTriggers to prevent duplicates on re-renders
    const triggers = ScrollTrigger.getAll();
    triggers.forEach(trigger => {
      if (trigger.trigger === el) trigger.kill();
    });

    gsap.fromTo(
      charElements,
      {
        opacity: 0,
        yPercent: 130, // Start slightly lower for dramatic effect
        scaleY: 1.5,   // Stretched vertically
        scaleX: 0.8,   // Compressed horizontally
        transformOrigin: '50% 0%'
      },
      {
        duration: animationDuration,
        ease: ease,
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger: stagger,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: scrollStart,
          end: scrollEnd,
          scrub: 1, // Adds a 1-second smoothness lag for a "heavy/premium" feel
        }
      }
    );

    return () => {
       // Cleanup specific triggers
       const triggers = ScrollTrigger.getAll();
       triggers.forEach(trigger => {
         if (trigger.trigger === el) trigger.kill();
       });
    };
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <h2 ref={containerRef} className={`overflow-hidden ${containerClassName}`}>
      <span className={`inline-block ${textClassName}`}>{splitText}</span>
    </h2>
  );
};

export default ScrollFloat;