import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  o: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Respect prefers-reduced-motion — leave the canvas blank, no animation.
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    // On phones the O(n²) connection loop can drop frames — halve the count.
    const isSmallViewport = window.innerWidth < 768;

    let animId: number | null = null;
    let particles: Particle[] = [];
    const count = isSmallViewport ? 35 : 80;
    const maxDist = 120;
    let isVisible = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(8, 145, 178, ${p.o * 0.6})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(8, 145, 178, ${0.08 * (1 - dist / maxDist)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    const start = () => {
      if (animId === null) draw();
    };
    const stop = () => {
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    };

    // Pause animation when canvas scrolls out of viewport — saves CPU and
    // keeps scroll smooth for the rest of the page.
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
          if (isVisible) start();
          else stop();
        },
        { rootMargin: "100px" }
      );
      observer.observe(canvas);
    } else {
      start();
    }

    // Also pause when the tab is hidden — no point burning CPU in background
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (isVisible) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
}
