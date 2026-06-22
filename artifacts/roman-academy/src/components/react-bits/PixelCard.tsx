import { useEffect, useRef } from 'react';

class Pixel {
  width: number; height: number; ctx: CanvasRenderingContext2D;
  x: number; y: number; color: string; speed: number; size: number;
  sizeStep: number; minSize: number; maxSizeInteger: number; maxSize: number;
  delay: number; counter: number; counterStep: number;
  isIdle: boolean; isReverse: boolean; isShimmer: boolean;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, x: number, y: number, color: string, speed: number, delay: number) {
    this.width = canvas.width; this.height = canvas.height; this.ctx = ctx;
    this.x = x; this.y = y; this.color = color;
    this.speed = this.getRandomValue(0.1, 0.9) * speed;
    this.size = 0; this.sizeStep = Math.random() * 0.4; this.minSize = 0.5;
    this.maxSizeInteger = 2; this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    this.delay = delay; this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false; this.isReverse = false; this.isShimmer = false;
  }

  getRandomValue(min: number, max: number) { return Math.random() * (max - min) + min; }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size);
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) { this.counter += this.counterStep; return; }
    if (this.size >= this.maxSize) this.isShimmer = true;
    if (this.isShimmer) this.shimmer(); else this.size += this.sizeStep;
    this.draw();
  }

  disappear() {
    this.isShimmer = false; this.counter = 0;
    if (this.size <= 0) { this.isIdle = true; return; }
    else this.size -= 0.1;
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) this.isReverse = true;
    else if (this.size <= this.minSize) this.isReverse = false;
    if (this.isReverse) this.size -= this.speed; else this.size += this.speed;
  }
}

function getEffectiveSpeed(value: number, reducedMotion: boolean) {
  if (value <= 0 || reducedMotion) return 0;
  if (value >= 100) return 0.1;
  return value * 0.001;
}

interface PixelCardProps {
  variant?: 'default' | 'gold' | 'blue' | 'pink';
  gap?: number;
  speed?: number;
  colors?: string;
  noFocus?: boolean;
  className?: string;
  children: React.ReactNode;
}

const VARIANTS = {
  default: { activeColor: null, gap: 5, speed: 35, colors: '#D4AF37,#F3D27A,#B8962E', noFocus: false },
  gold:    { activeColor: '#F3D27A', gap: 8, speed: 25, colors: '#D4AF37,#F3D27A,#fff3a0,#B8962E', noFocus: false },
  blue:    { activeColor: '#e0f2fe', gap: 10, speed: 25, colors: '#e0f2fe,#7dd3fc,#0ea5e9', noFocus: false },
  pink:    { activeColor: '#fecdd3', gap: 6, speed: 80, colors: '#fecdd3,#fda4af,#e11d48', noFocus: true },
};

export default function PixelCard({ variant = 'gold', gap, speed, colors, noFocus, className = '', children }: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number | null>(null);
  const timePreviousRef = useRef(performance.now());
  const reducedMotion = useRef(typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false).current;

  const variantCfg = VARIANTS[variant] || VARIANTS.gold;
  const finalGap = gap ?? variantCfg.gap;
  const finalSpeed = speed ?? variantCfg.speed;
  const finalColors = colors ?? variantCfg.colors;
  const finalNoFocus = noFocus ?? variantCfg.noFocus;

  const initPixels = () => {
    if (!containerRef.current || !canvasRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width); const height = Math.floor(rect.height);
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    canvasRef.current.width = width; canvasRef.current.height = height;
    canvasRef.current.style.width = `${width}px`; canvasRef.current.style.height = `${height}px`;
    const colorsArray = finalColors.split(',');
    const pxs: Pixel[] = [];
    for (let x = 0; x < width; x += finalGap) {
      for (let y = 0; y < height; y += finalGap) {
        const color = colorsArray[Math.floor(Math.random() * colorsArray.length)];
        const dx = x - width / 2; const dy = y - height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delay = reducedMotion ? 0 : distance;
        pxs.push(new Pixel(canvasRef.current!, ctx, x, y, color, getEffectiveSpeed(finalSpeed, reducedMotion), delay));
      }
    }
    pixelsRef.current = pxs;
  };

  const doAnimate = (fnName: 'appear' | 'disappear') => {
    animationRef.current = requestAnimationFrame(() => doAnimate(fnName));
    const timeNow = performance.now();
    const timePassed = timeNow - timePreviousRef.current;
    if (timePassed < 1000 / 60) return;
    timePreviousRef.current = timeNow - (timePassed % (1000 / 60));
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    let allIdle = true;
    for (const pixel of pixelsRef.current) {
      pixel[fnName]();
      if (!pixel.isIdle) allIdle = false;
    }
    if (allIdle && animationRef.current !== null) cancelAnimationFrame(animationRef.current);
  };

  const handleAnimation = (name: 'appear' | 'disappear') => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(() => doAnimate(name));
  };

  useEffect(() => {
    initPixels();
    const observer = new ResizeObserver(() => initPixels());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => { observer.disconnect(); if (animationRef.current !== null) cancelAnimationFrame(animationRef.current); };
  }, [finalGap, finalSpeed, finalColors, finalNoFocus]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden grid place-items-center border border-gold-400/20 rounded-2xl isolate transition-colors duration-200 select-none bg-navy-900 ${className}`}
      onMouseEnter={() => handleAnimation('appear')}
      onMouseLeave={() => handleAnimation('disappear')}
      onFocus={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) handleAnimation('appear'); }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) handleAnimation('disappear'); }}
      tabIndex={finalNoFocus ? -1 : 0}
    >
      <canvas className="absolute inset-0 w-full h-full block pointer-events-none" ref={canvasRef} />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
