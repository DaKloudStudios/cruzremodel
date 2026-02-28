import React, { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl';

const vertex = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  
  // Grid settings
  float scale = 40.0;
  float thickness = 0.001;
  
  // Moving grid logic
  float moveSpeed = 0.05;
  vec2 movingUV = uv + vec2(uTime * moveSpeed * 0.5, uTime * moveSpeed * 0.2);
  
  // Calculate grid lines
  vec2 grid = fract(movingUV * scale);
  float lines = step(grid.x, thickness * scale) + step(grid.y, thickness * scale);
  
  // Subtle wave distortion
  float wave = sin(uv.x * 10.0 + uTime) * 0.02;
  
  // Color configuration: #f1d805 (241, 216, 5)
  // Converted to 0.0-1.0 range: 0.945, 0.847, 0.02
  vec3 lineColor = vec3(0.945, 0.847, 0.02); 
  
  // Increased opacity slightly to ensure it 'pops' against white without needing overlay help
  float alpha = smoothstep(0.0, 1.0, lines) * 0.3; 
  
  gl_FragColor = vec4(lineColor, alpha);
}
`;

export const BlueprintGrid: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      canvas,
      alpha: true, // Transparent background
    });

    const gl = renderer.gl;
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2() },
      },
      transparent: true,
    });

    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      renderer.setSize(w, h);
      program.uniforms.uResolution.value.set(w, h);
    };

    window.addEventListener('resize', resize);
    resize();

    let frame: number;
    const loop = (t: number) => {
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="w-full h-full block opacity-50 pointer-events-none mix-blend-multiply" />;
};