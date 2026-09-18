import type { ActionItem, ProcessingStatus } from '../types';

interface Props {
  items: ActionItem[];
  status: ProcessingStatus;
  studentName: string;
  onOpen: (item: ActionItem) => void;
}

const PRIORITY_META: Record<ActionItem['priority'], { label: string; icon: string }> = {
  high: { label: 'High', icon: '🔴' },
  medium: { label: 'Medium', icon: '🟡' },
  low: { label: 'Low', icon: '🟢' },
  not_relevant: { label: 'Not relevant', icon: '⚪' },
};

export function ActionQueue({ items, status, studentName, onOpen }: Props) {
  return (
    <section className="card" aria-labelledby="queue-heading">
      <div className="card-head">
        <h2 id="queue-heading">Personalized action queue</h2>
        <span className="muted small">for {studentName}</span>
      </div>

      {status === 'processing' ? (
        <div className="empty" role="status" aria-live="polite">
          <p className="empty-title">Processing announcements…</p>
          <p className="muted">Personalizing the queue for {studentName}.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          <p className="empty-title">No actions to show</p>
          <p className="muted">
            Paste announcements on the left and click “Process Announcement” to build the queue.
          </p>
        </div>
      ) : (
        <ul className="queue-list">
          {items.map((item) => {
            const meta = PRIORITY_META[item.priority];
            return (
              <li key={item.id} className={`queue-item priority-${item.priority}`}>
                <div className="queue-top">
                  <span
                    className={`priority-badge priority-${item.priority}`}
                    aria-label={`Priority ${meta.label}`}
                  >
                    <span aria-hidden="true">{meta.icon}</span> {meta.label.toUpperCase()}
                  </span>
                  <span className="category-chip">{item.category}</span>
                </div>
                <h3 className="queue-title">{item.title}</h3>
                <dl className="queue-meta">
                  <div>
                    <dt>Deadline</dt>
                    <dd>{item.deadline}</dd>
                  </div>
                  <div>
                    <dt>Required action</dt>
                    <dd>{item.requiredAction}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={() => onOpen(item)}
                >
                  Why this?
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
