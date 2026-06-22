import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollFloatProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  once?: boolean;
}

export default function ScrollFloat({
  children,
  className = '',
  delay = 0,
  duration = 0.7,
  yOffset = 24,
  once = false,
}: ScrollFloatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: yOffset }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
