import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import type { Point, PenState } from "../types";
import { tauriInvoke, isTauri } from "../hooks/useTauriInvoke";

function pointsToPath(points: Point[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

export interface OverlayCanvasHandle {
  undo: () => void;
}

interface Props {
  pen: PenState;
  smoothing: number;
  calligraphy: boolean;
  clickThrough: boolean;
}

export const OverlayCanvas = forwardRef<OverlayCanvasHandle, Props>(
  function OverlayCanvas({ pen, smoothing, calligraphy, clickThrough }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const strokesRef = useRef<
      Array<{ path: string; color: string; width: number }>
    >([]);
    const currentPointsRef = useRef<Point[]>([]);
    const drawingRef = useRef(false);

    const redraw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const stroke of strokesRef.current) {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke(new Path2D(stroke.path));
      }

      if (currentPointsRef.current.length > 1) {
        ctx.strokeStyle = pen.color;
        ctx.lineWidth = pen.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke(new Path2D(pointsToPath(currentPointsRef.current)));
      }
      ctx.restore();
    }, [pen.color, pen.width]);

    const resizeCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      redraw();
    }, [redraw]);

    useEffect(() => {
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      return () => window.removeEventListener("resize", resizeCanvas);
    }, [resizeCanvas]);

    useImperativeHandle(ref, () => ({
      undo: () => {
        strokesRef.current.pop();
        redraw();
      },
    }));

    const smoothPath = async (points: Point[]) => {
      if (isTauri() && points.length >= 2) {
        try {
          return await tauriInvoke<string>("smooth_points", {
            points,
            strength: smoothing,
            calligraphy,
          });
        } catch {
          return pointsToPath(points);
        }
      }
      return pointsToPath(points);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
      if (clickThrough) return;
      drawingRef.current = true;
      currentPointsRef.current = [
        { x: e.clientX, y: e.clientY, t: Date.now() },
      ];
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = async (e: React.PointerEvent) => {
      if (!drawingRef.current || clickThrough) return;
      currentPointsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        t: Date.now(),
      });

      if (currentPointsRef.current.length >= 4) {
        const path = await smoothPath(currentPointsRef.current);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (ctx && canvas) {
          ctx.save();
          ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          for (const stroke of strokesRef.current) {
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.stroke(new Path2D(stroke.path));
          }
          ctx.strokeStyle = pen.color;
          ctx.lineWidth = pen.width;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke(new Path2D(path));
          ctx.restore();
        }
        return;
      }
      redraw();
    };

    const handlePointerUp = async () => {
      if (!drawingRef.current) return;
      drawingRef.current = false;

      if (currentPointsRef.current.length >= 2) {
        const path = await smoothPath(currentPointsRef.current);
        strokesRef.current.push({
          path,
          color: pen.color,
          width: pen.width,
        });
      }
      currentPointsRef.current = [];
      redraw();
    };

    return (
      <canvas
        ref={canvasRef}
        className={`overlay-canvas ${clickThrough ? "click-through" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    );
  }
);
