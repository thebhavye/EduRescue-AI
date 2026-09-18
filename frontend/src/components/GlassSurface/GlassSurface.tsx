import { useEffect, useRef } from 'react';

interface GlassSurfaceProps {
  children: React.ReactNode;
  className?: string;
  blur?: boolean;
  bgColor?: string;
}

const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  className = '',
  blur = true,
  bgColor = 'rgba(15, 23, 42, 0.5)',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const style = ref.current.style;
    style.background = bgColor;
    style.border = '1px solid rgba(255, 255, 255, 0.1)';
    style.borderRadius = '12px';
    style.padding = '1.5rem';
    style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    style.backdropFilter = blur ? 'blur(12px)' : 'none';

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        if (!ref.current) return;
        style.backdropFilter = blur ? 'blur(12px)' : 'none';
      });

      resizeObserver.observe(ref.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [bgColor, blur]);

  return (
    <div ref={ref} className={`glass-surface ${className}`}>
      {children}
    </div>
  );
};

export default GlassSurface;
export type { GlassSurfaceProps };
export { GlassSurface };