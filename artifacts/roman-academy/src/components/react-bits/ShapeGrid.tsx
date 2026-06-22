import React, { useRef, useEffect } from 'react';

type CanvasStrokeStyle = string | CanvasGradient | CanvasPattern;

interface ShapeGridProps {
  direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left';
  speed?: number;
  borderColor?: CanvasStrokeStyle;
  squareSize?: number;
  hoverFillColor?: CanvasStrokeStyle;
  shape?: 'square' | 'hexagon' | 'circle' | 'triangle';
  hoverTrailAmount?: number;
  className?: string;
}

const ShapeGrid: React.FC<ShapeGridProps> = ({
  direction = 'diagonal',
  speed = 0.5,
  borderColor = 'rgba(212,175,55,0.15)',
  squareSize = 40,
  hoverFillColor = 'rgba(212,175,55,0.08)',
  shape = 'square',
  hoverTrailAmount = 0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquareRef = useRef<{ x: number; y: number } | null>(null);
  const trailCells = useRef<{ x: number; y: number }[]>([]);
  const cellOpacities = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const offsetX = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
      const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;
      const cols = Math.ceil(canvas.width / squareSize) + 3;
      const rows = Math.ceil(canvas.height / squareSize) + 3;

      for (let col = -2; col < cols; col++) {
        for (let row = -2; row < rows; row++) {
          const sx = col * squareSize + offsetX;
          const sy = row * squareSize + offsetY;
          const cellKey = `${col},${row}`;
          const alpha = cellOpacities.current.get(cellKey);
          if (alpha) {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = hoverFillColor as string;
            ctx.fillRect(sx, sy, squareSize, squareSize);
            ctx.globalAlpha = 1;
          }
          ctx.strokeStyle = borderColor as string;
          ctx.strokeRect(sx, sy, squareSize, squareSize);
        }
      }

      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2,
        Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(5,11,26,0.85)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const updateCellOpacities = () => {
      const targets = new Map<string, number>();
      if (hoveredSquareRef.current) {
        targets.set(`${hoveredSquareRef.current.x},${hoveredSquareRef.current.y}`, 1);
      }
      if (hoverTrailAmount > 0) {
        for (let i = 0; i < trailCells.current.length; i++) {
          const t = trailCells.current[i];
          const key = `${t.x},${t.y}`;
          if (!targets.has(key)) {
            targets.set(key, (trailCells.current.length - i) / (trailCells.current.length + 1));
          }
        }
      }
      for (const [key] of targets) {
        if (!cellOpacities.current.has(key)) cellOpacities.current.set(key, 0);
      }
      for (const [key, opacity] of cellOpacities.current) {
        const target = targets.get(key) || 0;
        const next = opacity + (target - opacity) * 0.15;
        if (next < 0.005) cellOpacities.current.delete(key);
        else cellOpacities.current.set(key, next);
      }
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case 'right': gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize; break;
        case 'left':  gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize; break;
        case 'up':    gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize; break;
        case 'down':  gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize; break;
        case 'diagonal':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
      }
      updateCellOpacities();
      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const offsetX = ((gridOffset.current.x % squareSize) + squareSize) % squareSize;
      const offsetY = ((gridOffset.current.y % squareSize) + squareSize) % squareSize;
      const col = Math.round((event.clientX - rect.left - offsetX) / squareSize);
      const row = Math.round((event.clientY - rect.top - offsetY) / squareSize);
      if (!hoveredSquareRef.current || hoveredSquareRef.current.x !== col || hoveredSquareRef.current.y !== row) {
        if (hoveredSquareRef.current && hoverTrailAmount > 0) {
          trailCells.current.unshift({ ...hoveredSquareRef.current });
          if (trailCells.current.length > hoverTrailAmount) trailCells.current.length = hoverTrailAmount;
        }
        hoveredSquareRef.current = { x: col, y: row };
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [direction, speed, borderColor, squareSize, hoverFillColor, shape, hoverTrailAmount]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full absolute inset-0 ${className}`}
      style={{ display: 'block' }}
    />
  );
};

export default ShapeGrid;
