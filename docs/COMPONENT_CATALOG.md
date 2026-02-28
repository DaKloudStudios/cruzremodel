# Component Catalog

This document provides a detailed breakdown of the visual components, their behaviors, and specific implementation details within the Cruz Remodel application.

## 1. Global Elements

### `SpotlightParticles` (Global)
*   **Location:** Fixed background (`z-0`).
*   **Behavior:** A canvas layer covering the entire screen. Particles float randomly.
*   **Interaction:** Acts as a "flashlight". Particles are invisible (`baseOpacity=0`) until the mouse moves near them (`spotlightOpacity=0.6`), revealing the background texture in a gold hue.

---

## 2. Section Components

### `Hero.tsx`
*   **Background Layer:**
    *   **Iridescence (WebGL):** A liquid metal simulation using shader code. Configured to look like heavy, flowing champagne gold.
    *   **Overlays:** Radial gradients and a bottom fade to blend seamlessly into the next section.
*   **Typography (Hierarchy):**
    *   **Top Line:** "Cruz Remodel is". Rendered in **huge text (text-8xl)** with an *infinite linear gold gradient animation*.
    *   **Bottom Line:** A rotating text box ("redefining quality", etc.). Encased in a glass pill with gold borders.
*   **Video Container:**
    *   A floating glass card containing an HTML5 Video.
    *   **Logic:** Tries to load a high-res video from Firebase. If it fails, falls back to Pexels. If that fails, shows a placeholder.
    *   **Play Button:** A custom floating button in the center. Clicking it plays the video, smooth-scrolls it to center, and fades out the overlay.

### `StatsBar.tsx`
*   **Design:** A single floating "Dark Glass" card (`bg-navy-900/80`) overlapping the bottom of the Hero.
*   **Content:** 4 Data points (Years, Projects, Area, Rating).
*   **Animation:**
    *   **Counter:** Numbers count up from 0 when they enter the viewport.
    *   **Local Particles:** Has its own instance of `SpotlightParticles` contained *inside* the card for a contained premium effect.

### `BeforeAfter.tsx`
*   **Core Feature:** An interactive comparison slider.
*   **Visuals:**
    *   Displays two images superimposed.
    *   A vertical divider line allows the user to reveal one or the other.
*   **"Magic" Effect:** A dedicated `<canvas>` overlay tracks the slider handle. When the user drags:
    *   Gold/White particles are emitted from the line.
    *   The particles respect physics (velocity, gravity, fade out).
    *   This adds a tactile, "magical" feel to the renovation reveal.

### `Reviews.tsx`
*   **Layout:** CSS Columns (Masonry) layout to handle reviews of varying lengths.
*   **Interactivity:**
    *   **Filter Bar:** Pill buttons to filter reviews by category (All, Quality, Service, Results).
    *   **Yelp Button:** Direct link to the Yelp page.
*   **Card Design:** Dark Navy cards with a subtle border. On hover, a large Quote icon in the background glows and rotates.

### `Process.tsx`
*   **Background:** `BlueprintGrid.tsx` - A WebGL canvas drawing a faint architectural grid that moves slowly, simulating a blueprint.
*   **Steps:** 3 cards connected by a visual line.
*   **Animation:**
    *   **Title:** Uses `ScrollFloat` (GSAP) to animate the title characters floating up as the user scrolls.
    *   **Cards:** Reveal sequentially using `RevealOnScroll`. The background numbers (01, 02, 03) light up on hover.

### `Team.tsx`
*   **Design:** A single, high-impact "Founder Profile" card.
*   **Visuals:**
    *   **Image:** Rotating gold background effect behind the profile picture.
    *   **Quote:** Large serif quote with a gold quote icon.
*   **Animation:** The card floats up using `RevealOnScroll`.

### `Timeline.tsx`
*   **Design:** Vertical line with alternating content blocks.
*   **Visuals:**
    *   Gold gradient line down the center.
    *   Glass cards for events.
    *   Year bubbles on the center line that scale up on hover.

### `FAQ.tsx`
*   **Behavior:** Accordion style. Only one item opens at a time.
*   **Visuals:**
    *   When active, the border turns gold and the background darkens.
    *   Smooth height transition.

---

## 3. Floating Widgets

### `ChatAssistant.tsx`
*   **State:** Closed (FAB) vs Open (Window).
*   **Engine:** Google Gemini (`gemini-2.5-flash`).
*   **Behavior:**
    *   **Strict Mode:** The AI acts as a customer support agent. It refuses to answer questions outside its knowledge base (e.g., specific pricing) and refers users to the phone number.
    *   **UI:** Shows a "typing" animation while fetching. Messages are colored Gold (User) and Navy (AI).

### `StickyCTA.tsx`
*   **Behavior:** Appears only after scrolling down 500px.
*   **Design:** Floating pill button at the bottom right.
*   **Animation:** Has a "pinging" dot to attract attention.
