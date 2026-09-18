import { useRef, useEffect } from 'react';

const BG_CLOUD_COUNT = 5;
const BG_ANIMATION_SPEED = 0.05;

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const clouds: Array<{ x: number; y: number; w: number; h: number; speed: number }> = [];
    for (let i = 0; i < BG_CLOUD_COUNT; i++) {
      clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.3,
        w: 100 + Math.random() * 150,
        h: 40 + Math.random() * 40,
        speed: 0.5 + Math.random() * 1,
      });
    }

    let animationId: number;
    let running = true;

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';

      clouds.forEach((cloud) => {
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.w, cloud.h, 0, 0, Math.PI * 2);
        ctx.fill();

        cloud.x -= cloud.speed * BG_ANIMATION_SPEED;
        if (cloud.x + cloud.w < 0) {
          cloud.x = canvas.width + Math.random() * canvas.width;
          cloud.y = Math.random() * canvas.height * 0.3;
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      running = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="bg-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  );
}