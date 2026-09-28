import React, { useEffect, useRef, useState } from 'react';
import { LAUNCHER_SCREEN_X, LAUNCHER_SCREEN_Y } from '../render/ProjectileRenderer';

export interface ScalingBackgroundProps {
  /** Image URL. Falls back to `fallback` gradient if missing. */
  src: string;
  /** CSS gradient shown when the image is absent. */
  fallback: string;
  /** Current launch speed in m/s. */
  speed: number;
  /** Speed at which the full image fits the container. */
  maxSpeed?: number;
  /** Extra zoom applied at the slowest speed. */
  maxZoom?: number;
  /** Fraction of the image (measured from the bottom) occupied by the ground. */
  groundFraction?: number;
  /** Fraction of the image (from the left) treated as the launch point. */
  launchFractionX?: number;
  className?: string;
}

export const ScalingBackground: React.FC<ScalingBackgroundProps> = ({
  src,
  fallback,
  speed,
  maxSpeed = 120,
  maxZoom = 3.2,
  groundFraction = 182 / 767,
  launchFractionX = 0.18,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [failed, setFailed] = useState(false);

  // Load the image to read its natural dimensions.
  useEffect(() => {
    setFailed(false);
    setNatural(null);
    const img = new Image();
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => {
      setFailed(true);
      setNatural(null);
    };
    img.src = src;
  }, [src]);

  // Track container size.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const update = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w: W, h: H } = box;

  let imgStyle: React.CSSProperties | null = null;

  if (natural && W > 0 && H > 0 && !failed) {
    const fitScale = Math.min(W / natural.w, H / natural.h);
    const baseW = natural.w * fitScale;
    const baseH = natural.h * fitScale;

    const safeSpeed = Math.max(speed, 0.5);
    const zoom = Math.min(maxZoom, Math.sqrt(maxSpeed / safeSpeed));

    const originX = launchFractionX * baseW;
    const originY = (1 - groundFraction) * baseH;

    const ballX = W * LAUNCHER_SCREEN_X;
    const ballY = H * LAUNCHER_SCREEN_Y;

    const tx = ballX - originX * zoom;
    const ty = ballY - originY * zoom;

    imgStyle = {
      position: 'absolute',
      left: 0,
      top: 0,
      width: `${baseW}px`,
      height: `${baseH}px`,
      transformOrigin: '0 0',
      transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
      transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
      willChange: 'transform',
      pointerEvents: 'none',
      userSelect: 'none',
      opacity: 0.85,
    };
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundImage: fallback,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {imgStyle ? <img src={src} alt="" draggable={false} style={imgStyle} /> : null}
    </div>
  );
};