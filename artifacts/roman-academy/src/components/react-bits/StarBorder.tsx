import React, { useRef } from 'react';
import { motion } from 'framer-motion';

interface StarBorderProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  color?: string;
  as?: React.ElementType;
  onClick?: () => void;
  href?: string;
}

export default function StarBorder({
  children,
  className = '',
  speed = 6,
  color = '#D4AF37',
  as: Tag = 'button',
  onClick,
  href,
}: StarBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const stars = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    delay: (i / 6) * speed,
  }));

  return (
    <Tag
      ref={containerRef as any}
      className={`relative inline-flex items-center justify-center overflow-hidden ${className}`}
      onClick={onClick}
      href={href}
    >
      {/* Star particles orbit */}
      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute block rounded-full pointer-events-none"
          style={{
            width: 4,
            height: 4,
            background: color,
            boxShadow: `0 0 6px 2px ${color}`,
          }}
          animate={{
            x: [
              Math.cos((star.id / 6) * Math.PI * 2) * 120 - 2,
              Math.cos(((star.id + 0.33) / 6) * Math.PI * 2) * 120 - 2,
              Math.cos(((star.id + 0.67) / 6) * Math.PI * 2) * 120 - 2,
              Math.cos((star.id / 6) * Math.PI * 2) * 120 - 2,
            ],
            y: [
              Math.sin((star.id / 6) * Math.PI * 2) * 20 - 2,
              Math.sin(((star.id + 0.33) / 6) * Math.PI * 2) * 20 - 2,
              Math.sin(((star.id + 0.67) / 6) * Math.PI * 2) * 20 - 2,
              Math.sin((star.id / 6) * Math.PI * 2) * 20 - 2,
            ],
            opacity: [0.8, 1, 0.8, 0.8],
          }}
          transition={{
            duration: speed,
            delay: star.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Animated border gradient */}
      <motion.span
        className="absolute inset-0 rounded-inherit pointer-events-none"
        style={{
          borderRadius: 'inherit',
          padding: 1,
          background: `conic-gradient(from var(--angle, 0deg), transparent 80%, ${color} 90%, transparent 100%)`,
        }}
        animate={{ '--angle': ['0deg', '360deg'] } as any}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        <span
          className="block w-full h-full rounded-inherit"
          style={{ borderRadius: 'inherit', background: 'transparent' }}
        />
      </motion.span>

      {children}
    </Tag>
  );
}
