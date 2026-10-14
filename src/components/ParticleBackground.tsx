import React, { useEffect, useRef } from 'react';

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const mouse = { x: -9999, y: -9999 };
    const PARTICLE_COUNT = 45;
    const CONNECT_DIST = 130;
    const MOUSE_RADIUS = 150;

    const COLORS = [
      'rgba(30, 64, 175, ',  // Primary Blue
      'rgba(5, 150, 105, ',  // Secondary Emerald
      'rgba(79, 70, 229, ',  // Indigo
      'rgba(14, 165, 233, ', // Sky
    ];

    const handleResize = () => {
      if (!canvas) return;
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    class Particle {
      x: number;
      y: number;
      r: number;
      baseR: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      phase: number;
      pSpeed: number;

      constructor() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = Math.random() * 2.2 + 0.8;
        this.baseR = this.r;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.alpha = Math.random() * 0.25 + 0.08;
        this.phase = Math.random() * Math.PI * 2;
        this.pSpeed = Math.random() * 0.015 + 0.005;
      }

      update() {
        this.phase += this.pSpeed;
        this.r = this.baseR + Math.sin(this.phase) * 0.4;

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && mouse.x > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * 1.1;
          this.vy += Math.sin(angle) * force * 1.1;
        }

        this.vx *= 0.985;
        this.vy *= 0.985;
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) { this.x = 0; this.vx *= -0.5; }
        if (this.x > W) { this.x = W; this.vx *= -0.5; }
        if (this.y < 0) { this.y = 0; this.vy *= -0.5; }
        if (this.y > H) { this.y = H; this.vy *= -0.5; }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.2, this.r), 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${this.alpha})`;
        ctx.fill();

        // Subtle glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.5, this.r * 2.5), 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, Math.max(1, this.r * 2.5));
        grad.addColorStop(0, `${this.color}0.05)`);
        grad.addColorStop(1, `${this.color}0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, W, H);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // Connections between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);

          if (d < CONNECT_DIST) {
            const alpha = (1 - d / CONNECT_DIST) * 0.08;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(30, 64, 175, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Mouse interactive connection
      if (mouse.x > 0) {
        for (let i = 0; i < particles.length; i++) {
          const dxM = particles[i].x - mouse.x;
          const dyM = particles[i].y - mouse.y;
          const dM = Math.sqrt(dxM * dxM + dyM * dyM);
          if (dM < MOUSE_RADIUS) {
            const alpha = (1 - dM / MOUSE_RADIUS) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(5, 150, 105, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Subtle smooth gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/15" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Floating geometric decorative elements */}
      <div className="absolute top-[8%] left-[5%] w-24 h-24 opacity-[0.04] animate-pulse">
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-blue-700" fill="none" strokeWidth="2">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" />
        </svg>
      </div>

      <div className="absolute top-[18%] right-[8%] w-20 h-20 opacity-[0.04]">
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-emerald-700" fill="none" strokeWidth="2">
          <polygon points="50,10 90,90 10,90" />
        </svg>
      </div>

      <div className="absolute bottom-[15%] left-[8%] w-32 h-32 opacity-[0.03]">
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-blue-800" fill="none" strokeWidth="1.5">
          <circle cx="50" cy="50" r="42" strokeDasharray="6 4" />
        </svg>
      </div>
    </div>
  );
};
