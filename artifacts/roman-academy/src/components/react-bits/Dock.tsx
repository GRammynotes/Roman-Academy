'use client';

import { motion, MotionValue, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import React, { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react';

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  distance: number;
  baseItemSize: number;
  magnification: number;
  label?: React.ReactNode;
};

function DockItem({ children, className = '', onClick, mouseX, distance, magnification, baseItemSize, label }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);
  const spring = { mass: 0.1, stiffness: 150, damping: 12 };

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize };
    return val - rect.x - baseItemSize / 2;
  });
  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full bg-navy-900 border border-gold-400/20 shadow-md cursor-pointer ${className}`}
      tabIndex={0}
      role="button"
    >
      {Children.map(children, (child) =>
        React.isValidElement(child)
          ? cloneElement(child as React.ReactElement<{ isHovered?: MotionValue<number> }>, { isHovered })
          : child
      )}
    </motion.div>
  );
}

function DockLabel({ children, className = '', isHovered }: { children: React.ReactNode; className?: string; isHovered?: MotionValue<number> }) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (!isHovered) return;
    return isHovered.on('change', (v) => setIsVisible(v === 1));
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: -10 }} exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`${className} absolute -top-8 left-1/2 whitespace-pre rounded-md border border-gold-400/20 bg-navy-900 px-2 py-0.5 text-xs text-gold-300 font-semibold shadow-lg`}
          role="tooltip" style={{ x: '-50%', transform: 'translateX(-50%)' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = '' }: { children: React.ReactNode; className?: string; isHovered?: MotionValue<number> }) {
  return <div className={`flex items-center justify-center ${className}`}>{children}</div>;
}

export default function Dock({ items, className = '', magnification = 60, distance = 150, panelHeight = 56, dockHeight = 200, baseItemSize = 44 }: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const spring = { mass: 0.1, stiffness: 150, damping: 12 };

  const maxHeight = useMemo(() => Math.max(dockHeight, magnification + magnification / 2 + 4), [magnification]);
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <motion.div style={{ height, scrollbarWidth: 'none' }} className="flex max-w-full items-center">
      <motion.div
        onMouseMove={({ pageX }) => { isHovered.set(1); mouseX.set(pageX); }}
        onMouseLeave={() => { isHovered.set(0); mouseX.set(Infinity); }}
        className={`${className} flex items-end gap-3 rounded-2xl border border-gold-400/20 bg-navy-950/90 backdrop-blur-xl pb-2 px-4`}
        style={{ height: panelHeight }}
      >
        {items.map((item, index) => (
          <DockItem key={index} onClick={item.onClick} className={item.className}
            mouseX={mouseX} distance={distance} magnification={magnification} baseItemSize={baseItemSize} label={item.label}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
