# Cruz Remodel - Elite Experience Landing Page

A high-conversion, premium "About Us" landing page designed for Cruz Remodel, the Bay Area's premier home transformation experts. This project features cinema-quality visuals, complex WebGL animations, Generative AI integration, and a sophisticated "Navy & Gold" aesthetic.

## 🌟 Key Features

*   **Cinematic Hero Section:**
    *   Background liquid gold simulation (WebGL).
    *   Video background with smart fallback logic.
    *   **New:** High-contrast typography with infinite gold gradient loop and rotating text.
*   **AI Chat Assistant:**
    *   Powered by Google Gemini (`gemini-2.5-flash`).
    *   Context-aware agent ("Cruz AI") with a strict knowledge base about the business.
*   **Interactive Visuals:**
    *   **Before/After Slider:** Custom interactive slider with "fairy dust" particle effects on drag.
    *   **Founder Spotlight:** Premium profile section featuring the CEO/Founder.
    *   **Spotlight Particles:** Interactive background particles that react to mouse movement.
*   **User Experience:**
    *   **Masonry Reviews:** Responsive grid for client testimonials with category filtering.
    *   **Scroll Animations:** GSAP and Intersection Observer text reveals.

## 🛠 Tech Stack

*   **Core:** React 19, TypeScript
*   **Styling:** Tailwind CSS (Custom Config)
*   **AI:** Google GenAI SDK (`@google/genai`)
*   **Animation & Graphics:**
    *   `OGL` (High-performance WebGL for Backgrounds)
    *   `GSAP` & `ScrollTrigger` (Complex text reveals)
    *   `Framer Motion` (Rotating text transitions)
    *   `Canvas API` (Custom particle systems)
*   **Icons:** Lucide React

## 📂 Project Structure

*   `components/` - Visual components (Hero, Team, ChatAssistant, etc.).
*   `types.ts` - TypeScript definitions.
*   `docs/` - Detailed documentation.

## 🚀 Quick Start

See [SETUP_AND_DEPLOYMENT.md](docs/SETUP_AND_DEPLOYMENT.md) for detailed installation instructions.

## 📖 Documentation

*   [**Component Catalog (Detailed)**](docs/COMPONENT_CATALOG.md) - **READ THIS for a full breakdown of UI behavior.**
*   [Architecture Overview](docs/ARCHITECTURE.md)
*   [Data & API Reference](docs/DATA_AND_API_REFERENCE.md)
*   [UI Design System](docs/UI_DESIGN_SYSTEM.md)
