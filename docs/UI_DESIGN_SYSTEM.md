# UI Design System

The Cruz Remodel design system is built on a "Dark Luxury" aesthetic, utilizing deep blacks, navies, and metallic golds.

## Color Palette

### The "Cruz Navy" (Base)
*   **Navy 950 (`#000000`):** Pure black is used as the primary background for maximum contrast with gold elements.
*   **Navy 900 (`#09090b`):** Rich Black/Zinc. Used for card backgrounds (`bg-navy-900/80`) to provide subtle depth against the pure black background.
*   **Navy 800 (`#27272a`):** Used for UI borders, secondary button states, and inputs.

### The "Cruz Gold" (Accent)
*   **Gold 100 (`#faeec7`):** Champagne. Used for text highlights and high-luminosity particles.
*   **Gold 200 (`#fde68a`):** Bright Gold. Used in gradients.
*   **Gold 400 (`#d4af37`):** True Metallic Gold. Used for primary icons, borders, and the "Liquid Gold" shader.
*   **Gold 500 (`#b4941f`):** Dark/Shadow Gold. Used for depth in gradients.

### The "Brand Red" (Action)
*   **Red (`#aa1919`):** Deep luxurious red. Used sparingly for high-priority actions (Yelp button) and review stars.

## Typography

### Headlines: `Playfair Display`
*   A serif font that evokes elegance and craftsmanship.
*   Used for: `h1` Hero title, Section Headers, "Before/After" labels.

### Body: `Inter`
*   A clean sans-serif font for readability.
*   Used for: Paragraphs, UI buttons, Chat interface, Stats numbers.

## Visual Effects & Tokens

### 1. The "Infinite Gold" Gradient
A custom CSS animation applied to the Hero text (`Cruz Remodel está`).
*   **Behavior:** A linear gradient moves continuously from left to right (0% to 200% background position).
*   **Loop:** Seamless linear loop (no bouncing).
*   **Colors:** Zinc 400 -> White -> Gold 200 -> Gold 400 -> White -> Zinc 400.

### 2. Glassmorphism (Dark)
Used on cards (Stats, Reviews, Chat Window).
*   `backdrop-blur-xl` or `backdrop-blur-md`
*   Background: `bg-navy-900/80` or `bg-black/40`
*   Border: `border-white/10` or `border-gold-500/30`
*   Shadow: `shadow-lg`

### 3. "Fairy Dust" Particles
Used in the `BeforeAfter` component.
*   **Trigger:** Active dragging of the slider.
*   **Visual:** Tiny particles of White, Champagne, and Gold are emitted from the slider handle line using HTML5 Canvas.

### 4. Global Noise
A subtle SVG noise filter (`bg-noise`) is applied fixed to the viewport with `opacity-30`. This prevents "color banding" in the dark gradients and adds a premium texture.
