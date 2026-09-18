import React from 'react';
import { useRef, useCallback, useEffect, useState } from 'react';

interface BorderGlowProps {
  children: React.ReactNode;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  className?: string;
}

const BorderGlow: React.FC<BorderGlowProps> = ({
  children,
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor = '#0f0f13',
  glowRadius = 40,
  glowIntensity = 1.0,
  coneSpread = 25,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [edgeProximity, setEdgeProximity] = useState(0);
  const [cursorAngle, setCursorAngle] = useState(0);

  const handlePointerMove = useCallback((e: MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    // Calculate distance from center
    const cx = width / 2;
    const cy = height / 2;
    const dx = x - cx;
    const dy = y - cy;

    // Calculate edge proximity
    const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
    const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
    const edgeDist = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    setEdgeProximity(edgeDist);

    // Calculate angle
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    setCursorAngle(degrees);
  }, []);

  useEffect(() => {
    if (!cardRef.current) return;
    cardRef.current.addEventListener('pointermove', handlePointerMove);
    return () => {
      if (cardRef.current) {
        cardRef.current.removeEventListener('pointermove', handlePointerMove);
      }
    };
  }, [handlePointerMove]);

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [handlePointerMove]);

  const style: React.CSSProperties & { [key: string]: string | number } = {
    '--edge-proximity': `${edgeProximity * 100}%`,
    '--cursor-angle': `${cursorAngle}deg`,
    '--card-bg': backgroundColor,
    '--edge-sensitivity': edgeSensitivity,
    '--border-radius': '12px',
    '--glow-padding': `${glowRadius}px`,
    '--cone-spread': coneSpread,
    '--glow-intensity': glowIntensity,
    '--glow-color': glowColor,
    background: backgroundColor,
    borderRadius: '12px',
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
  };

  // Inner glow layer
  const innerGlowStyle: React.CSSProperties & { [key: string]: string | number } = {
    position: 'absolute',
    inset: 0,
    borderRadius: '12px',
    pointerEvents: 'none',
    background: `linear-gradient(
      ${String(coneSpread)}deg,
      transparent 0%,
      rgba(0, 0, 0, 0.1) 50%,
      transparent 100%
    )`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  };

  const onHover = edgeProximity > edgeSensitivity / 100;

  return (
    <div
      ref={cardRef}
      className={`border-glow-card ${className}`}
      style={style}
    >
      {children}
      {onHover && (
        <div
          style={{
            ...innerGlowStyle,
            opacity: 0.6,
            animation: 'sweep 1.5s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
};

// Keyframes for sweep animation
const sweepKeyframes = `
  @keyframes sweep {
    0% { transform: rotate(110deg); }
    100% { transform: rotate(465deg); }
  }
`;
const sweepStyle = document.createElement('style');
sweepStyle.innerHTML = sweepKeyframes;
document.head.appendChild(sweepStyle);

export default BorderGlow;
export type { BorderGlowProps };
export { BorderGlow };