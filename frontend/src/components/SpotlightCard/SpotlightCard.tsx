import { useRef, useCallback, useEffect, useState } from 'react';

interface SpotlightCardProps {
  children: React.ReactNode;
  spotlightColor?: string;
  className?: string;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  spotlightColor = 'rgba(255, 255, 255, 0.25)',
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pointerX, setPointerX] = useState(0);
  const [pointerY, setPointerY] = useState(0);

  const handlePointerMove = useCallback((e: MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPointerX(x);
    setPointerY(y);
  }, []);

  useEffect(() => {
    return () => {
      if (cardRef.current) {
        window.removeEventListener('pointermove', handlePointerMove);
      }
    };
  }, [handlePointerMove]);

  useEffect(() => {
    if (!cardRef.current) return;
    cardRef.current.addEventListener('pointermove', handlePointerMove);
    return () => {
      if (cardRef.current) {
        cardRef.current.removeEventListener('pointermove', handlePointerMove);
      }
    };
  }, []);

  const centerX = pointerX / (cardRef.current?.clientWidth || 1);
  const centerY = pointerY / (cardRef.current?.clientHeight || 1);
  const rotateX = (centerY - 0.5) * 20;
  const rotateY = (centerX - 0.5) * -20;
  const gradientPosX = centerX * 100;
  const gradientPosY = centerY * 100;

  return (
    <div
      ref={cardRef}
      className={`spotlight-card ${className}`}
      style={{
        background: `radial-gradient(
          ellipse at ${gradientPosX}% ${gradientPosY}%,
          transparent 0%,
          ${spotlightColor} 40%
        )`,
        transform: `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};

export default SpotlightCard;
export type { SpotlightCardProps };
export { SpotlightCard };