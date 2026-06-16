"use client";

import React, { useEffect, useRef } from "react";

interface LightfallProps {
  colors?: string[];
  backgroundColor?: string;
  speed?: number;
  streakCount?: number;
  streakWidth?: number;
  streakLength?: number;
  density?: number;
  twinkle?: number;
  glow?: number;
  backgroundGlow?: number;
  zoom?: number;
  opacity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  mouseRadius?: number;
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
}

export const Lightfall: React.FC<LightfallProps> = ({
  colors = ["#D4AF37", "#F7E7A1", "#0A2342"],
  backgroundColor = "transparent",
  speed = 0.5,
  streakCount = 30,
  streakWidth = 1,
  streakLength = 1,
  density = 0.6,
  twinkle = 1,
  glow = 1,
  backgroundGlow = 0.5,
  zoom = 1,
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 0.5,
  mouseRadius = 1,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    const meteors: Meteor[] = [];
    const initMeteors = () => {
      meteors.length = 0;
      const totalMeteors = Math.floor(streakCount * density * (width / 500));
      for (let i = 0; i < totalMeteors; i++) {
        meteors.push({
          x: Math.random() * width,
          y: Math.random() * height - height,
          length: (Math.random() * 80 + 20) * streakLength * zoom,
          width: (Math.random() * 1.5 + 0.5) * streakWidth * zoom,
          speed: (Math.random() * 3 + 1) * speed * zoom,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.5 + 0.1,
          twinkleSpeed: (Math.random() * 0.05 + 0.01) * twinkle,
        });
      }
    };

    initMeteors();

    const handleMouseMove = (e: MouseEvent) => {
      if (mouseInteraction) {
        mouseRef.current = { x: e.clientX, y: e.clientY };
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove);

    const draw = () => {
      // Clear canvas with background color or transparency
      ctx.clearRect(0, 0, width, height);
      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }
      
      // Draw background glow if needed
      if (backgroundGlow > 0) {
        const gradient = ctx.createRadialGradient(width / 2, 0, 0, width / 2, 0, height);
        gradient.addColorStop(0, `rgba(212, 175, 55, ${0.1 * backgroundGlow * opacity})`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.globalAlpha = opacity;

      meteors.forEach((meteor) => {
        // Move meteor
        meteor.y += meteor.speed;
        
        // Twinkle effect
        if (twinkle > 0) {
          meteor.opacity += meteor.twinkleSpeed;
          if (meteor.opacity > 0.8 || meteor.opacity < 0.1) {
            meteor.twinkleSpeed *= -1;
          }
        }

        // Mouse interaction
        let offsetX = 0;
        if (mouseInteraction) {
          const dx = mouseRef.current.x - meteor.x;
          const dy = mouseRef.current.y - meteor.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 200 * mouseRadius;
          
          if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            offsetX = -(dx / distance) * force * 10 * mouseStrength;
          }
        }

        // Reset if off screen
        if (meteor.y > height) {
          meteor.y = -meteor.length;
          meteor.x = Math.random() * width;
        }

        // Draw meteor streak
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(
          meteor.x + offsetX,
          meteor.y,
          meteor.x + offsetX,
          meteor.y + meteor.length
        );
        
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.8, meteor.color);
        gradient.addColorStop(1, "white");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = meteor.width;
        
        if (glow > 0) {
          ctx.shadowBlur = 10 * glow;
          ctx.shadowColor = meteor.color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.moveTo(meteor.x + offsetX, meteor.y);
        ctx.lineTo(meteor.x + offsetX, meteor.y + meteor.length);
        ctx.stroke();
        ctx.closePath();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colors, backgroundColor, speed, streakCount, streakWidth, streakLength, density, twinkle, glow, backgroundGlow, zoom, opacity, mouseInteraction, mouseStrength, mouseRadius]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none -z-10 ${className}`}
      style={{ opacity }}
    />
  );
};
