import React, { useEffect, useRef } from "react";

interface LightfallProps {
  colors?: string[];
  backgroundColor?: string;
  speed?: number;
  streakCount?: number;
  className?: string;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  width: number;
  speed: number;
  color: string;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export const Lightfall: React.FC<LightfallProps> = ({
  colors = ["#D4AF37", "#F7E7A1", "#0A2342"],
  backgroundColor = "transparent",
  speed = 0.5,
  streakCount = 20,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    setSize();
    window.addEventListener("resize", setSize);

    const meteors: Meteor[] = [];
    const init = () => {
      meteors.length = 0;
      for (let i = 0; i < streakCount; i++) {
        meteors.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: 60 + Math.random() * 80,
          width: 0.5 + Math.random() * 1.5,
          speed: (0.3 + Math.random() * 0.7) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: 0.1 + Math.random() * 0.4,
          twinkleSpeed: 0.005 + Math.random() * 0.02,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
    };
    init();

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }

      t += 0.016;

      for (const m of meteors) {
        m.y += m.speed;
        if (m.y > height + m.length) {
          m.y = -m.length;
          m.x = Math.random() * width;
        }

        const twinkle = m.opacity * (0.6 + 0.4 * Math.sin(t * 60 * m.twinkleSpeed + m.twinkleOffset));
        const grad = ctx.createLinearGradient(m.x, m.y - m.length, m.x, m.y);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(1, m.color + Math.round(twinkle * 255).toString(16).padStart(2, "0"));

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.width;
        ctx.moveTo(m.x, m.y - m.length);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", setSize);
    };
  }, [colors, backgroundColor, speed, streakCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.6 }}
    />
  );
};
