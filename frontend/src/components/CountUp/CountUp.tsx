import { useEffect, useState } from 'react';

interface CountUpProps {
  value: number | string;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
  duration?: number;
  separator?: boolean;
  className?: string;
}

const CounterNumber: React.FC<CountUpProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimalPlaces = 0,
  duration = 2000,
  separator = false,
  className = '',
}) => {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    const num = typeof value === 'number' ? value : Number(value);
    if (isNaN(num)) {
      setFormatted(String(value));
      return;
    }

    const format = separator ? num.toLocaleString(undefined, { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }) : num.toFixed(decimalPlaces);

    // Animate from 0 to the target value
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setFormatted(`${prefix}${format}${suffix}`);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, prefix, suffix, decimalPlaces, duration, separator]);

  return <span className={className}>{formatted}</span>;
};

export default CounterNumber;
export type { CountUpProps };
export { CounterNumber };