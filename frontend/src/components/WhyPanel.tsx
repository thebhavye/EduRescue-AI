import { useRef, useState, useEffect } from 'react';
import type { ActionItem } from '../types';

interface Props {
  item: ActionItem | null;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement>;
}

export function WhyPanel({
  item,
  onClose,
  triggerRef,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(item !== null);
  }, [item]);

  if (!open) return null;

  if (!item) return null;

  const meta = {
    high: { icon: '⚡', label: 'High' },
    medium: { icon: '🟡', label: 'Medium' },
    low: { icon: '🟢', label: 'Low' },
    not_relevant: { icon: '⚪', label: 'Not relevant' },
  }[item.priority];

  return (
    <div
      className="overlay"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-head">
          <h2>Why this?</h2>
          <button type="button" className="link-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="why-facts">
          <div>
            <dt>Priority</dt>
            <dd>
              <span aria-hidden="true">{meta.icon}</span> {meta.label}
            </dd>
          </div>
          <div>
            <dt>Title</dt>
            <dd>{item.title}</dd>
          </div>
        </div>

        <div className="why-sub">
          <p>{item.requiredAction}</p>
        </div>

        <ul className="why-list">
          {item.eligibility.status === 'eligible' && (
            <li data-polarity="positive">Eligible for this action</li>
          )}
          {item.eligibility.status === 'not_eligible' && (
            <li data-polarity="negative">Not eligible for this action</li>
          )}
          {item.eligibility.status === 'action_optional' && (
            <li data-polarity="positive">Optional action</li>
          )}
        </ul>
      </div>
    </div>
  );
}