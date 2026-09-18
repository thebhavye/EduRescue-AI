import { useMemo } from 'react';
import CountUp from '../CountUp/CountUp';
import type { ActionItem } from '../../types';

interface SummaryMetricsProps {
  queue: ActionItem[];
}

const SummaryMetrics: React.FC<SummaryMetricsProps> = ({ queue }) => {
  const metrics = useMemo(() => {
    const total = queue.length;
    const relevant = queue.filter((i) => i.priority !== 'not_relevant').length;
    const actionRequired = queue.filter((i) => i.eligibility.status === 'eligible').length;
    const urgent = queue.filter((i) => i.priority === 'high').length;
    return { total, relevant, actionRequired, urgent };
  }, [queue]);

  return (
    <section className="card metrics-summary" aria-labelledby="metrics-heading">
      <h2 id="metrics-heading" className="card-head">
        <span className="eyebrow">Summary</span> Metrics
      </h2>
      <div className="metrics-grid">
        <div className="metric-item">
          <CountUp
            value={metrics.total}
            prefix={metrics.total + ' '}
            suffix="Announcements"
            decimalPlaces={0}
            separator
            className="metric-count"
          />
        </div>
        <div className="metric-item">
          <CountUp
            value={metrics.relevant}
            prefix={metrics.relevant + ' '}
            suffix="Relevant"
            decimalPlaces={0}
            separator
            className="metric-count"
          />
        </div>
        <div className="metric-item">
          <CountUp
            value={metrics.actionRequired}
            prefix={metrics.actionRequired + ' '}
            suffix="Action Required"
            decimalPlaces={0}
            separator
            className="metric-count"
          />
        </div>
        <div className="metric-item">
          <CountUp
            value={metrics.urgent}
            prefix={metrics.urgent + ' '}
            suffix="Urgent"
            decimalPlaces={0}
            separator
            className="metric-count"
          />
        </div>
      </div>
    </section>
  );
};

export default SummaryMetrics;
export type { SummaryMetricsProps };
export { SummaryMetrics };