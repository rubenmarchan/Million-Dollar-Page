
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PixelBlock, Selection, ViewState, Point } from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GRID_COLOR, 
  SELECTION_COLOR, 
  SELECTION_BORDER,
  OVERLAP_COLOR,
  OVERLAP_BORDER,
  MIN_ZOOM,
  MAX_ZOOM,
  MIN_PURCHASE_SIZE
} from '../constants';

interface PixelCanvasProps {
  blocks: PixelBlock[];
  activeSelection: Selection | null;
  onSelectionChange: (selection: Selection | null) => void;
}

const PixelCanvas: React.FC<PixelCanvasProps> = ({ blocks, activeSelection, onSelectionChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewState, setViewState] = useState<ViewState>(() => {
    const initialScale = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT) * 0.9;
    return {
      scale: initialScale,
      offsetX: (window.innerWidth - CANVAS_WIDTH * initialScale) / 2,
      offsetY: (window.innerHeight - CANVAS_HEIGHT * initialScale) / 2,
    };
  });
  
  const isPanning = useRef(false);
  const lastMousePos = useRef<Point>({ x: 0, y: 0 });
  const isSelecting = useRef(false);
  const lastTouchDist = useRef<number | null>(null);

  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  const isPointInAnyBlock = useCallback((x: number, y: number) => {
    return blocks.some(b => x >= b.x && x < b.x + b.width && y >= b.y && y < b.y + b.height);
  }, [blocks]);

  const checkOverlap = useCallback((selX: number, selY: number, selW: number, selH: number) => {
    return blocks.some(b => {
      return (
        selX < b.x + b.width &&
        selX + selW > b.x &&
        selY < b.y + b.height &&
        selY + selH > b.y
      );
    });
  }, [blocks]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(viewState.offsetX, viewState.offsetY);
    ctx.scale(viewState.scale, viewState.scale);

    // Canvas Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1 / viewState.scale;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grid
    if (viewState.scale > 4) {
      ctx.beginPath();
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 0.5 / viewState.scale;
      for (let x = 0; x <= CANVAS_WIDTH; x += 10) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += 10) {
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
      }
      ctx.stroke();
    }

    // Render Blocks
    blocks.forEach(block => {
      ctx.fillStyle = block.color;
      ctx.fillRect(block.x, block.y, block.width, block.height);

      if (block.imageUrl) {
        let img = imageCache.current.get(block.imageUrl);
        if (!img) {
          img = new Image();
          img.src = block.imageUrl;
          img.onload = () => draw();
          imageCache.current.set(block.imageUrl, img);
        }
        if (img.complete) {
          ctx.drawImage(img, block.x, block.y, block.width, block.height);
        }
      }

      if (block.text && viewState.scale > 0.3) {
        ctx.fillStyle = 'white';
        const fontSize = Math.max(8, block.height / 5);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(block.text, block.x + block.width / 2, block.y + block.height / 2);
      }
    });

    // Render Active Selection
    if (activeSelection) {
      const x = Math.min(activeSelection.startX, activeSelection.currentX);
      const y = Math.min(activeSelection.startY, activeSelection.currentY);
      const w = Math.abs(activeSelection.currentX - activeSelection.startX);
      const h = Math.abs(activeSelection.currentY - activeSelection.startY);

      ctx.fillStyle = activeSelection.isOverlapping ? OVERLAP_COLOR : SELECTION_COLOR;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = activeSelection.isOverlapping ? OVERLAP_BORDER : SELECTION_BORDER;
      ctx.lineWidth = 2 / viewState.scale;
      ctx.strokeRect(x, y, w, h);
      
      if (viewState.scale > 0.8) {
        ctx.fillStyle = 'white';
        ctx.font = `${12 / viewState.scale}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`${w}x${h}`, x + w / 2, y + h + (15 / viewState.scale));
      }
    }

    ctx.restore();
  }, [viewState, blocks, activeSelection]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        draw();
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  useEffect(() => { draw(); }, [draw]);

  const screenToWorld = (clientX: number, clientY: number): Point => {
    return {
      x: (clientX - viewState.offsetX) / viewState.scale,
      y: (clientY - viewState.offsetY) / viewState.scale,
    };
  };

  const snapToGrid = (val: number) => Math.floor(val / 10) * 10;

  const handleMouseDown = (e: React.MouseEvent) => {
    const worldPos = screenToWorld(e.clientX, e.clientY);
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    if (e.button === 2 || (e.button === 0 && e.altKey)) {
      isPanning.current = true;
    } else if (e.button === 0) {
      // CLAMP start position to canvas boundaries
      const snappedX = Math.max(0, Math.min(CANVAS_WIDTH, snapToGrid(worldPos.x)));
      const snappedY = Math.max(0, Math.min(CANVAS_HEIGHT, snapToGrid(worldPos.y)));
      
      // Prevent selection starting inside sold block
      if (isPointInAnyBlock(snappedX, snappedY)) return;

      isSelecting.current = true;
      
      // Initial second point slightly offset but also clamped
      const initX = Math.max(0, Math.min(CANVAS_WIDTH, snappedX + MIN_PURCHASE_SIZE));
      const initY = Math.max(0, Math.min(CANVAS_HEIGHT, snappedY + MIN_PURCHASE_SIZE));

      onSelectionChange({
        startX: snappedX,
        startY: snappedY,
        currentX: initX,
        currentY: initY,
        isActive: true,
        isOverlapping: false
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setViewState(prev => ({
        ...prev,
        offsetX: prev.offsetX + dx,
        offsetY: prev.offsetY + dy,
      }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    } else if (isSelecting.current && activeSelection) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      let targetX = snapToGrid(worldPos.x);
      let targetY = snapToGrid(worldPos.y);

      // Enforce minimum purchase size
      if (Math.abs(targetX - activeSelection.startX) < MIN_PURCHASE_SIZE) {
        targetX = activeSelection.startX + (targetX >= activeSelection.startX ? MIN_PURCHASE_SIZE : -MIN_PURCHASE_SIZE);
      }
      if (Math.abs(targetY - activeSelection.startY) < MIN_PURCHASE_SIZE) {
        targetY = activeSelection.startY + (targetY >= activeSelection.startY ? MIN_PURCHASE_SIZE : -MIN_PURCHASE_SIZE);
      }

      // FINAL CLAMPING to ensure the current pointer never leaves the 1080x1920 region
      const clampedX = Math.max(0, Math.min(CANVAS_WIDTH, targetX));
      const clampedY = Math.max(0, Math.min(CANVAS_HEIGHT, targetY));

      const rectX = Math.min(activeSelection.startX, clampedX);
      const rectY = Math.min(activeSelection.startY, clampedY);
      const rectW = Math.abs(clampedX - activeSelection.startX);
      const rectH = Math.abs(clampedY - activeSelection.startY);

      const isOverlapping = checkOverlap(rectX, rectY, rectW, rectH);

      onSelectionChange({
        ...activeSelection,
        currentX: clampedX,
        currentY: clampedY,
        isOverlapping
      });
    }
  };

  const handleEnd = () => {
    isPanning.current = false;
    isSelecting.current = false;
    lastTouchDist.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.min(Math.max(viewState.scale * factor, MIN_ZOOM), MAX_ZOOM);
    const mouseWorld = screenToWorld(e.clientX, e.clientY);
    setViewState(prev => ({
      scale: newScale,
      offsetX: e.clientX - mouseWorld.x * newScale,
      offsetY: e.clientY - mouseWorld.y * newScale,
    }));
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      className="w-full h-full cursor-crosshair bg-slate-950 touch-none"
    />
  );
};

export default PixelCanvas;
