"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
};

const COLORS = ["#8b7cf6", "#f28fb4", "#56b9e9", "#63c7ae", "#e2b760"];

export function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let width = 0;
    let height = 0;
    let pointerX = -1000;
    let pointerY = -1000;
    let particles: Particle[] = [];

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(14, Math.min(34, Math.round(width / 34)));
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        radius: 1.4 + Math.random() * 2.8,
        color: COLORS[index % COLORS.length],
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        const dx = particle.x - pointerX;
        const dy = particle.y - pointerY;
        const distance = Math.hypot(dx, dy);
        if (!reducedMotion.matches && distance < 110 && distance > 0) {
          particle.x += (dx / distance) * (110 - distance) * 0.008;
          particle.y += (dy / distance) * (110 - distance) * 0.008;
        }
        if (!reducedMotion.matches) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x < -8) particle.x = width + 8;
          if (particle.x > width + 8) particle.x = -8;
          if (particle.y < -8) particle.y = height + 8;
          if (particle.y > height + 8) particle.y = -8;
        }
        context.beginPath();
        context.fillStyle = `${particle.color}70`;
        context.shadowBlur = 14;
        context.shadowColor = particle.color;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
      context.shadowBlur = 0;
      if (!reducedMotion.matches) frame = requestAnimationFrame(draw);
    };

    const handlePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointerX = event.clientX - bounds.left;
      pointerY = event.clientY - bounds.top;
    };
    const clearPointer = () => {
      pointerX = -1000;
      pointerY = -1000;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", handlePointer);
    canvas.addEventListener("pointerleave", clearPointer);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", handlePointer);
      canvas.removeEventListener("pointerleave", clearPointer);
    };
  }, []);

  return <canvas ref={canvasRef} className="ambient-particles" aria-hidden />;
}
