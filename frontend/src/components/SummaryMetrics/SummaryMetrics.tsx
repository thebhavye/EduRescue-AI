import { useMemo } from 'react';
import type { ActionItem } from '../../types';

interface SummaryMetricsProps {
  queue: ActionItem[];
}

export function SummaryMetrics({ queue }: SummaryMetricsProps) {
  const metrics = useMemo(() => {
    const total = queue.length;
    const urgent = queue.filter((i) => i.priority === 'high').length;
    const relevant = queue.filter((i) => i.priority !== 'not_relevant').length;
    const eligible = queue.filter((i) => i.eligibility.status === 'eligible').length;
    return { total, urgent, relevant, eligible };
  }, [queue]);

  const cards = [
    { value: metrics.total, label: 'Announcements' },
    { value: metrics.urgent, label: 'Urgent' },
    { value: metrics.relevant, label: 'Relevant' },
    { value: metrics.eligible, label: 'Eligible' },
  ];

  return (
    <section className="card metrics-summary" id="metrics" aria-labelledby="metrics-heading">
      <h2 id="metrics-heading">Summary metrics</h2>
      <div className="metrics-grid">
        {cards.map((c) => (
          <div key={c.label} className="metric-item">
            <span className="metric-count">
              {c.value} {c.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SummaryMetrics;
export type { SummaryMetricsProps };
