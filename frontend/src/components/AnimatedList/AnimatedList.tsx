import React from 'react';
import { useRef, useEffect, useState } from 'react';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  visible?: boolean;
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  className = '',
  stagger = 100,
  direction = 'up',
  visible = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const observedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!visible) {
      observedRef.current = false;
      return;
    }

    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      observedRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observedRef.current = true;
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(element);
  }, [visible]);

  useEffect(() => {
    if (observedRef.current) {
      setIsVisible(true);
    }
  }, []);

  const styleRefs = useRef<Array<{ el: HTMLElement; delay: number }>>([]);

  useEffect(() => {
    if (!isVisible || !ref.current) return;

    const childrenArray = Array.from(ref.current.children) as HTMLElement[];
    styleRefs.current = childrenArray.map((el, index) => {
      el.style.transitionDelay = `${index * stagger}ms`;
      el.style.opacity = '1';
      el.style.transform = direction === 'up'
        ? 'translateY(20px)'
        : direction === 'down'
          ? 'translateY(-20px)'
          : direction === 'left'
            ? 'translateX(20px)'
            : 'translateX(-20px)';
      return { el, delay: index * stagger };
    });

    // Trigger reflow to start animation
    ref.current?.offsetHeight;

    const cleanup = () => {
      childrenArray.forEach(el => {
        el.style.transitionDelay = '';
        el.style.opacity = '';
        el.style.transform = '';
      });
    };

    return () => {
      cleanup();
    };
  }, [isVisible, stagger, direction]);

return (
    <div
      ref={ref}
      className={`animated-list ${className}`}
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {children}
    </div>
  );
};

export default AnimatedList;
export type { AnimatedListProps };
export { AnimatedList };