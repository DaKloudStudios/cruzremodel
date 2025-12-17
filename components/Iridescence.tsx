import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import React, { useEffect, useRef } from 'react';
import './Iridescence.css';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  // Interaction distortion
  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  
  // Fluid simulation loop
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  
  d += uTime * 0.5 * uSpeed;

  // -- Monochromatic Liquid Color Logic --
  // We want ONLY the yellow color, just varying in brightness to show depth.
  
  float val = sin(uv.x * d + a * 0.5) * 0.5 + 0.5;
  val = pow(val, 2.0); // Sharpen highlights

  // Mix colors:
  // Shadow: Darker version of input color (no black, just deep yellow)
  // Base: Input color
  // Highlight: Brighter version of input color (no white, just bright yellow)
  
  vec3 shadow = uColor * 0.6;   // Darker yellow
  vec3 base = uColor;           // The main yellow #f1d805
  vec3 highlight = uColor * 1.3; // Very bright yellow (clamped at render)
  
  vec3 col = mix(shadow, base, smoothstep(0.0, 0.6, val));
  col = mix(col, highlight, smoothstep(0.6, 1.0, val));
  
  // Ensure we don't blow out to white if not intended, though * 1.3 usually stays saturated
  col = clamp(col, 0.0, 1.0);
  
  gl_FragColor = vec4(col, 1.0);
}
`;

interface IridescenceProps {
  color?: [number, number, number];
  speed?: number;
  amplitude?: number;
  mouseReact?: boolean;
  className?: string;
  [key: string]: any;
}

export default function Iridescence({ 
  color = [1, 1, 1], 
  speed = 1.0, 
  amplitude = 0.1, 
  mouseReact = true, 
  className = '',
  ...rest 
}: IridescenceProps) {
  const ctnDom = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (!ctnDom.current) return;
    const ctn = ctnDom.current;
    const renderer = new Renderer({ alpha: true });
    const gl = renderer.gl;
    // Clearing to transparent/black
    gl.clearColor(0, 0, 0, 0);

    let program: Program;

    function resize() {
      const scale = 1;
      renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);
      if (program) {
        program.uniforms.uResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height
        );
      }
    }
    window.addEventListener('resize', resize, false);
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(color[0], color[1], color[2]) },
        uResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
        },
        uMouse: { value: new Float32Array([mousePos.current.x, mousePos.current.y]) },
        uAmplitude: { value: amplitude },
        uSpeed: { value: speed }
      }
    });

    const mesh = new Mesh(gl, { geometry, program });
    let animateId: number;

    function update(t: number) {
      animateId = requestAnimationFrame(update);
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    }
    animateId = requestAnimationFrame(update);
    ctn.appendChild(gl.canvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = ctn.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      mousePos.current = { x, y };
      program.uniforms.uMouse.value[0] = x;
      program.uniforms.uMouse.value[1] = y;
    };

    if (mouseReact) {
      ctn.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener('resize', resize);
      if (mouseReact) {
        ctn.removeEventListener('mousemove', handleMouseMove);
      }
      if (ctn.contains(gl.canvas)) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [color, speed, amplitude, mouseReact]);

  return <div ref={ctnDom} className={`iridescence-container ${className}`} {...rest} />;
}