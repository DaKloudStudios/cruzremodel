# Architecture Overview

## Application Structure

The application follows a standard React Component-based architecture. It is a Single Page Application (SPA) where `App.tsx` acts as the main composition layer, stacking distinct sections vertically and managing global overlays.

### Component Hierarchy

```text
index.tsx (Entry Point)
└── App.tsx (Main Layout)
    ├── Global Backgrounds
    │   └── SpotlightParticles.tsx (Canvas 2D)
    ├── Hero.tsx
    │   ├── Iridescence.tsx (WebGL Liquid Effect)
    │   ├── RotatingText.tsx (Framer Motion)
    │   └── HTMLVideoElement (Video Background)
    ├── StatsBar.tsx
    │   ├── SpotlightParticles.tsx (Scoped Instance)
    │   └── Counter Logic
    ├── BeforeAfter.tsx
    │   └── ComparisonSlider (Canvas 2D + DOM Clipping)
    ├── Reviews.tsx (Masonry Grid)
    ├── Process.tsx
    │   ├── BlueprintGrid.tsx (WebGL Lines)
    │   ├── ScrollFloat.tsx (GSAP)
    │   └── RevealOnScroll.tsx
    ├── Timeline.tsx
    ├── Team.tsx (Founder Profile)
    ├── FAQ.tsx
    ├── ChatAssistant.tsx (Fixed Floating Widget)
    ├── StickyCTA.tsx (Fixed Floating Button)
    └── Footer (Inline)
```

## Animation Strategy

The application uses a hybrid animation strategy to balance performance and visual fidelity:

1.  **WebGL (OGL Library):**
    *   Used for computationally expensive visual effects that require shader manipulation.
    *   **Hero Background:** Liquid gold effect (`Iridescence.tsx`).
    *   **Process Background:** Architectural grid lines (`BlueprintGrid.tsx`).

2.  **HTML5 Canvas (2D Context):**
    *   Used for particle systems that need high entity counts but simpler physics.
    *   **Global Background:** Ambient dust particles (`SpotlightParticles.tsx`).
    *   **Before/After Slider:** "Fairy dust" emission when dragging the slider handle.

3.  **GSAP (GreenSock):**
    *   Used for scroll-linked animations.
    *   **Text Reveals:** `ScrollFloat.tsx` splits text into characters and animates them in 3D space based on scroll position.

4.  **CSS & Tailwind:**
    *   Used for infinite loops (Golden Text Gradient).
    *   Used for micro-interactions (Hover states, glows, button scales).

## State Management

*   **Local State:**
    *   `ChatAssistant`: Manages message history and open/close state.
    *   `Hero`: Manages video loading, playback state, and fallback logic.
    *   `BeforeAfter`: Manages slider position (0-100%).

## AI Integration

*   **Google GenAI:** Direct integration in `ChatAssistant.tsx`.
*   **Model:** `gemini-2.5-flash`.
*   **Implementation:** The API key is accessed via `process.env.API_KEY`. The chat history is maintained in local state and sent with each request to maintain context, bounded by a strict System Instruction.
