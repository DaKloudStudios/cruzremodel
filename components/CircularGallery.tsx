// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import './CircularGallery.css';

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function createTextTexture(gl, text, font = 'bold 30px monospace', color = 'black') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  // HIGH RESOLUTION SETTINGS
  const fontSizeMatch = font.match(/(\d+)px/);
  const baseSize = fontSizeMatch ? parseInt(fontSizeMatch[1], 10) : 30;
  const scaleFactor = 6; // High res for crispness
  const highResSize = baseSize * scaleFactor;
  
  const highResFont = font.replace(/(\d+)px/, `${highResSize}px`);

  context.font = highResFont;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(highResSize * 1.5); 
  
  canvas.width = textWidth + (40 * scaleFactor);
  canvas.height = textHeight + (20 * scaleFactor);
  
  context.font = highResFont;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  // CLEAN TEXT - Just Bold, No Shadows
  context.fillStyle = color;
  context.fillText(text, centerX, centerY);
  
  const texture = new Texture(gl, { generateMipmaps: true, minFilter: gl.LINEAR_MIPMAP_LINEAR });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  constructor({ gl, plane, renderer, text, textColor = '#545050', font = '30px sans-serif' }) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }
  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.05) discard;
          // PREMULTIPLY ALPHA FIX: Multiply RGB by Alpha
          gl_FragColor = vec4(color.rgb * color.a, color.a);
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    
    // Scale text relative to the plane height
    const textHeight = this.plane.scale.y * 0.15; 
    const textWidth = textHeight * aspect;
    
    this.mesh.scale.set(textWidth, textHeight, 1);
    
    const padding = this.plane.scale.y * 0.05;
    this.mesh.position.y = -this.plane.scale.y * 0.5 - (textHeight * 0.5) - padding; 
    
    // Z-Offset: Push forward so it renders clearly in front
    this.mesh.position.z = 0.05;
    
    // FORCE DRAW ORDER: Text always last (top)
    this.mesh.renderOrder = 20;
    
    this.mesh.setParent(this.plane);
  }
}

class Media {
  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font
  }) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.bendOriginal = bend; 
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;

    // Create a Root Transform to group Image + Shadow
    this.root = new Transform();
    this.root.setParent(scene);

    this.createShader();
    // ORDER MATTERS FOR DRAWING: Create Shadow first (draws first/behind), then Image (draws second/top)
    this.createShadow(); 
    this.createMesh();
    
    this.createTitle(); // Title attached to plane (grandchild of root), draws last (topmost)
    this.onResize();
  }
  
  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: true,
      minFilter: this.gl.LINEAR_MIPMAP_LINEAR
    });
    // Vertex shader shared to ensure they bend together
    this.vertexShader = `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          // Subtle wave effect
          p.z = (sin(p.x * 4.0 + uTime) * 1.0 + cos(p.y * 2.0 + uTime) * 1.0) * (0.05 + uSpeed * 0.2);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
    `;

    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: this.vertexShader,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          // PREMULTIPLY ALPHA FIX: Multiply RGB by Alpha
          gl_FragColor = vec4(color.rgb * alpha, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [1, 1] }, // Initialize with safe values to prevent division by zero before load
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
    
    // IMAGE LOADING LOGIC
    const img = new Image();
    
    // IMPORTANT: CrossOrigin must be anonymous for WebGL textures to work with external URLs.
    img.crossOrigin = 'anonymous'; 
    
    img.onload = () => {
      texture.image = img;
      // Update shader with actual image dimensions
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
    
    img.onerror = (e) => {
       console.warn(`Failed to load image via proxy: ${this.image}`, e);
       // Fallback: Use a placeholder sized 760x1000 (0.76 aspect ratio)
       const fallbackImg = new Image();
       fallbackImg.crossOrigin = 'anonymous';
       fallbackImg.src = 'https://placehold.co/760x1000/1e293b/d4af37?text=Image+Unavailable';
       fallbackImg.onload = () => {
         texture.image = fallbackImg;
         this.program.uniforms.uImageSizes.value = [fallbackImg.naturalWidth, fallbackImg.naturalHeight];
       };
    };

    // PROXY STRATEGY FOR CORS (WebGL Security)
    // Firebase Storage (and many cloud buckets) block WebGL access by default (CORS).
    // To fix this without complex server config, we route requests through 'wsrv.nl'.
    // This adds the necessary 'Access-Control-Allow-Origin' headers and optimizes the image.
    const originalUrl = this.image;
    // We encode the URL to safely pass it as a parameter
    // w=800 limits resolution for better performance (gallery cards don't need 4k)
    // output=jpg ensures standard format
    const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}&w=800&output=jpg`;
    
    img.src = proxyUrl;
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    // FORCE DRAW ORDER: Image draws AFTER shadow
    this.plane.renderOrder = 10;
    this.plane.setParent(this.root); // Attach to root
  }

  createShadow() {
    this.shadowProgram = new Program(this.gl, {
      vertex: this.vertexShader,
      fragment: `
        precision highp float;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float alpha = 1.0 - smoothstep(-0.1, 0.1, d); // Softer edge
          // Dark shadow with moderate opacity (0.25) to look realistic but not too black
          // PREMULTIPLY ALPHA: 0.0 * 0.25 = 0.0. So RGB stays 0.0.
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.25 * alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0 },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true,
      depthTest: false,
    });
    
    this.shadowPlane = new Mesh(this.gl, {
        geometry: this.geometry,
        program: this.shadowProgram
    });
    // FORCE DRAW ORDER: Shadow draws FIRST
    this.shadowPlane.renderOrder = 1;
    this.shadowPlane.setParent(this.root); // Attach to root
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      fontFamily: this.font
    });
  }

  update(scroll, direction) {
    // Update ROOT position
    this.root.position.x = this.x - scroll.current - this.extra;

    const x = this.root.position.x;
    const H = this.viewport.width / 2;

    // Apply bend to ROOT
    if (this.bend === 0) {
      this.root.position.y = 0;
      this.root.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.root.position.y = -arc;
        this.root.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.root.position.y = arc;
        this.root.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    
    // Update main program uniforms
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    // Sync shadow program uniforms
    if (this.shadowProgram) {
        this.shadowProgram.uniforms.uTime.value = this.program.uniforms.uTime.value;
        this.shadowProgram.uniforms.uSpeed.value = this.program.uniforms.uSpeed.value;
    }

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    // Check using root position
    this.isBefore = this.root.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.root.position.x - planeOffset > viewportOffset;
    
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }
  
  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
    }
    
    const width = this.screen.width;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    
    // ADJUST BEND
    if (isMobile) {
      this.bend = this.bendOriginal / 2.5; 
    } else if (isTablet) {
      this.bend = this.bendOriginal / 1.5;
    } else {
      this.bend = this.bendOriginal;
    }

    // DIMENSIONS & SCALE LOGIC
    let responsiveHeight, responsiveWidth, paddingFactor, scaleDivisor;

    if (isMobile) {
      responsiveHeight = 280;
      responsiveWidth = 210; 
      paddingFactor = 1.5; 
      scaleDivisor = 600; 
    } else if (isTablet) {
      responsiveHeight = 400;
      responsiveWidth = 300;
      paddingFactor = 2.0; 
      scaleDivisor = 800;
    } else {
      responsiveHeight = 500;
      responsiveWidth = 380;
      paddingFactor = 2.5; 
      scaleDivisor = 1200;
    }

    this.scale = this.screen.height / scaleDivisor;
    
    // Apply scale to the inner plane
    this.plane.scale.y = (this.viewport.height * (responsiveHeight * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (responsiveWidth * this.scale)) / this.screen.width;
    
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    
    // Setup Shadow Scale & Position
    if (this.shadowPlane) {
        // Shadow matches plane scale
        this.shadowPlane.scale.set(this.plane.scale.x, this.plane.scale.y, 1);
        
        // Position Shadow: Below and slightly behind
        // We use the plane height to determine a proportional "drop"
        const yDrop = -this.plane.scale.y * 0.12; // 12% down
        // X offset 0 to look centered but floating
        // Z offset: Push back to -0.1 to avoid Z-fighting and ensure it's well behind
        this.shadowPlane.position.set(0, yDrop, -0.1);
    }
    
    this.padding = paddingFactor;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  constructor(
    container,
    {
      items,
      bend,
      textColor = '#ffffff',
      borderRadius = 0,
      font = 'bold 30px Figtree',
      scrollSpeed = 2,
      scrollEase = 0.05
    } = {}
  ) {
    document.documentElement.classList.remove('no-js');
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck, 200);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.update();
    this.addEventListeners();
  }
  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
      // REMOVED: premultipliedAlpha: false. Reverting to default (true) is better for compositing
      // as long as we multiply RGB by Alpha in the shader.
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }
  createScene() {
    this.scene = new Transform();
  }
  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100
    });
  }
  createMedias(items, bend = 1, textColor, borderRadius, font) {
    const defaultItems = [
      { image: `https://picsum.photos/seed/1/800/600?grayscale`, text: 'Bridge' },
      { image: `https://picsum.photos/seed/2/800/600?grayscale`, text: 'Desk Setup' },
      { image: `https://picsum.photos/seed/3/800/600?grayscale`, text: 'Waterfall' },
      { image: `https://picsum.photos/seed/4/800/600?grayscale`, text: 'Strawberries' }
    ];
    const galleryItems = items && items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font
      });
    });
  }
  onTouchDown(e) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e.touches ? e.touches[0].clientX : e.clientX;
  }
  onTouchMove(e) {
    if (!this.isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.scroll.position + distance;
  }
  onTouchUp() {
    this.isDown = false;
    this.onCheck();
  }
  onWheel(e) {
    const delta = e.deltaY || e.wheelDelta || e.detail;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }
  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }
  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }
  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      this.medias.forEach(media => media.update(this.scroll, direction));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }
  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    window.addEventListener('resize', this.boundOnResize);
    window.addEventListener('mousewheel', this.boundOnWheel);
    window.addEventListener('wheel', this.boundOnWheel);
    window.addEventListener('mousedown', this.boundOnTouchDown);
    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    window.addEventListener('touchstart', this.boundOnTouchDown);
    window.addEventListener('touchmove', this.boundOnTouchMove);
    window.addEventListener('touchend', this.boundOnTouchUp);
  }
  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundOnResize);
    window.removeEventListener('mousewheel', this.boundOnWheel);
    window.removeEventListener('wheel', this.boundOnWheel);
    window.removeEventListener('mousedown', this.boundOnTouchDown);
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    window.removeEventListener('touchstart', this.boundOnTouchDown);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    window.removeEventListener('touchend', this.boundOnTouchUp);
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px Figtree',
  scrollSpeed = 2,
  scrollEase = 0.05
}) {
  const containerRef = useRef(null);
  useEffect(() => {
    const app = new App(containerRef.current, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase });
    return () => {
      app.destroy();
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase]);
  return <div className="circular-gallery" ref={containerRef} />;
}