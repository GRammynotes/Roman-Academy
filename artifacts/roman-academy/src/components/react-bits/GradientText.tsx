import { useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'framer-motion';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  pauseOnHover?: boolean;
  yoyo?: boolean;
}

export default function GradientText({
  children,
  className = '',
  colors = ['#D4AF37', '#F3D27A', '#B8962E', '#D4AF37'],
  animationSpeed = 8,
  showBorder = false,
  direction = 'horizontal',
  pauseOnHover = false,
  yoyo = true,
}: GradientTextProps) {
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  const animationDuration = animationSpeed * 1000;

  useAnimationFrame((time) => {
    if (isPaused) { lastTimeRef.current = null; return; }
    if (lastTimeRef.current === null) { lastTimeRef.current = time; return; }
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += deltaTime;

    if (yoyo) {
      const fullCycle = animationDuration * 2;
      const cycleTime = elapsedRef.current % fullCycle;
      if (cycleTime < animationDuration) {
        progress.set((cycleTime / animationDuration) * 100);
      } else {
        progress.set(100 - ((cycleTime - animationDuration) / animationDuration) * 100);
      }
    } else {
      progress.set((elapsedRef.current / animationDuration) * 100);
    }
  });

  useEffect(() => { elapsedRef.current = 0; progress.set(0); }, [animationSpeed, yoyo]);

  const backgroundPosition = useTransform(progress, (p) => {
    if (direction === 'vertical') return `50% ${p}%`;
    return `${p}% 50%`;
  });

  const handleMouseEnter = useCallback(() => { if (pauseOnHover) setIsPaused(true); }, [pauseOnHover]);
  const handleMouseLeave = useCallback(() => { if (pauseOnHover) setIsPaused(false); }, [pauseOnHover]);

  const gradientAngle = direction === 'vertical' ? 'to bottom' : 'to right';
  const gradientColors = [...colors, colors[0]].join(', ');
  const gradientStyle = {
    backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
    backgroundSize: direction === 'vertical' ? '100% 300%' : '300% 100%',
    backgroundRepeat: 'repeat',
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showBorder && (
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none rounded-[1.25rem]"
          style={{ ...gradientStyle, backgroundPosition }}
        >
          <div className="absolute bg-navy-950 rounded-[1.25rem] z-[-1]"
            style={{ width: 'calc(100% - 2px)', height: 'calc(100% - 2px)', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
        </motion.div>
      )}
      <motion.span
        className="text-transparent bg-clip-text"
        style={{ ...gradientStyle, backgroundPosition, WebkitBackgroundClip: 'text' }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}
