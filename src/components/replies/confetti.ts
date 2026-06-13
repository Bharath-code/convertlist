/**
 * Tiny zero-dependency confetti — fires from a <canvas>.
 * No external library, ~80 LOC. Used by RepliesLive on detected replies.
 */

"use client";

import { useEffect, useRef } from "react";

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  colors?: string[];
  origin?: { x: number; y: number };
}

const DEFAULTS = {
  particleCount: 80,
  spread: 70,
  startVelocity: 35,
  decay: 0.94,
  gravity: 0.9,
  colors: ["#22c55e", "#10b981", "#a78bfa", "#f0abfc", "#fde68a"],
};

export function fireConfetti(opts: ConfettiOptions = {}) {
  if (typeof window === "undefined") return;
  const o = { ...DEFAULTS, ...opts };
  const origin = o.origin || { x: 0.5, y: 0.5 };

  // Use an offscreen canvas — no DOM pollution
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100dvh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const W = window.innerWidth;
  const H = window.innerHeight;

  type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number;
    size: number;
  };

  const particles: Particle[] = [];
  for (let i = 0; i < o.particleCount; i++) {
    const angle = (Math.random() - 0.5) * (o.spread * Math.PI) / 180;
    const velocity = o.startVelocity * (0.6 + Math.random() * 0.4);
    particles.push({
      x: origin.x * W,
      y: origin.y * H,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - Math.random() * 2,
      color: o.colors[Math.floor(Math.random() * o.colors.length)],
      life: 1,
      size: 6 + Math.random() * 4,
    });
  }

  let raf = 0;
  const start = performance.now();
  const tick = (now: number) => {
    const elapsed = (now - start) / 1000;
    ctx.clearRect(0, 0, W, H);
    let alive = 0;
    for (const p of particles) {
      p.vy += o.gravity;
      p.vx *= o.decay;
      p.vy *= o.decay;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.012;
      if (p.life <= 0 || p.y > H + 40) continue;
      alive++;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size * 0.4);
    }
    if (alive > 0 && elapsed < 4) {
      raf = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf);
      canvas.remove();
    }
  };
  raf = requestAnimationFrame(tick);
}

/** Optional hook helper. */
export function useConfetti() {
  const lastFired = useRef(0);
  useEffect(() => {
    lastFired.current = 0;
  }, []);
  return (origin?: { x: number; y: number }) => {
    const now = Date.now();
    if (now - lastFired.current < 800) return; // throttle
    lastFired.current = now;
    fireConfetti({ origin });
  };
}
