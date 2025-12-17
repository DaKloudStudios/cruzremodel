# Setup and Deployment

## Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn

## Local Development

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *Note: If using the ESM import map version (current state), standard npm install might not be required for runtime dependencies, but is needed for local tooling.*

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal) to view it in the browser.

## Build for Production

To create a production-ready build:

```bash
npm run build
```

This will generate a `dist` (or `build`) folder containing static assets.

## Deployment

Since this is a client-side React application, it can be hosted on any static site provider.

### Vercel / Netlify
1.  Connect your Git repository.
2.  Set the **Build Command** to: `npm run build`
3.  Set the **Output Directory** to: `dist`

## Environment Variables

Currently, the application does not utilize `.env` files. All asset URLs are public.

## Troubleshooting

*   **Video not playing:** Ensure your browser allows autoplay. Some browsers block autoplay video with sound; the video tag is set to autoplay but ensure `muted` is present if autoplay issues persist (though the current Hero design implies a visual background).
*   **3D Gallery Lag:** The `CircularGallery` depends on WebGL. Performance may vary on devices without hardware acceleration.
