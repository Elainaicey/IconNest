"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
};

const COLORS = ["#8b7cf6", "#ee8fb2", "#55b7e8", "#61c5ad", "#d9b35f"];
const FRAME_INTERVAL = 1000 / 30;

export function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    let frame = 0;
    let lastFrameAt = 0;
    let width = 0;
    let height = 0;
    let pointerX = -1000;
    let pointerY = -1000;
    const particles: Particle[] = [];

    const createParticle = (index: number): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      radius: 0.8 + Math.random() * 1.8,
      color: COLORS[index % COLORS.length],
      alpha: 0.2 + Math.random() * 0.34,
    });

    const paint = (animate: boolean) => {
      context.clearRect(0, 0, width, height);

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        const dx = particle.x - pointerX;
        const dy = particle.y - pointerY;
        const distance = Math.hypot(dx, dy);

        if (animate && !coarsePointer.matches && distance < 120 && distance > 0) {
          particle.x += (dx / distance) * (120 - distance) * 0.008;
          particle.y += (dy / distance) * (120 - distance) * 0.008;
        }

        if (animate) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x < -8) particle.x = width + 8;
          if (particle.x > width + 8) particle.x = -8;
          if (particle.y < -8) particle.y = height + 8;
          if (particle.y > height + 8) particle.y = -8;
        }

        for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
          const next = particles[nextIndex];
          const connectionDistance = Math.hypot(
            particle.x - next.x,
            particle.y - next.y,
          );
          if (connectionDistance > 118) continue;
          context.beginPath();
          context.globalAlpha = (1 - connectionDistance / 118) * 0.075;
          context.strokeStyle = particle.color;
          context.lineWidth = 0.7;
          context.moveTo(particle.x, particle.y);
          context.lineTo(next.x, next.y);
          context.stroke();
        }

        context.beginPath();
        context.globalAlpha = particle.alpha * 0.18;
        context.fillStyle = particle.color;
        context.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.globalAlpha = particle.alpha;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 1;
    };

    const tick = (timestamp: number) => {
      if (document.hidden || reducedMotion.matches) return;
      if (timestamp - lastFrameAt >= FRAME_INTERVAL) {
        paint(true);
        lastFrameAt = timestamp;
      }
      frame = requestAnimationFrame(tick);
    };

    const restart = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrameAt = 0;
      paint(false);
      if (!document.hidden && !reducedMotion.matches) {
        frame = requestAnimationFrame(tick);
      }
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const previousWidth = width;
      const previousHeight = height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      if (previousWidth && previousHeight) {
        for (const particle of particles) {
          particle.x = (particle.x / previousWidth) * width;
          particle.y = (particle.y / previousHeight) * height;
        }
      }

      const divisor = coarsePointer.matches ? 54 : 36;
      const maximum = coarsePointer.matches ? 26 : 46;
      const count = Math.max(16, Math.min(maximum, Math.round(width / divisor)));
      if (particles.length > count) particles.length = count;
      while (particles.length < count) particles.push(createParticle(particles.length));
      restart();
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
    const handleVisibility = () => restart();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("pointermove", handlePointer, { passive: true });
    window.addEventListener("pointerleave", clearPointer);
    document.addEventListener("visibilitychange", handleVisibility);
    reducedMotion.addEventListener("change", restart);
    coarsePointer.addEventListener("change", resize);
    resize();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("pointerleave", clearPointer);
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotion.removeEventListener("change", restart);
      coarsePointer.removeEventListener("change", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="ambient-particles" aria-hidden="true" />;
}
