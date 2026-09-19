import { useEffect, useRef } from 'react';
import type { ActionItem } from '../types';

interface Props {
  item: ActionItem | null;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function WhyPanel({ item, onClose, triggerRef }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = item !== null;

  // Focus the Close button when the dialog opens.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => closeRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open, item?.id]);

  // Close on Escape + restore focus to the trigger (if still connected).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  // Restore focus when the dialog unmounts/closes.
  useEffect(() => {
    if (open) return;
    const trigger = triggerRef?.current;
    if (trigger && trigger.isConnected) {
      trigger.focus();
    }
    return undefined;
  }, [open, triggerRef]);

  if (!open || !item) return null;

  const meta = {
    high: { icon: '🔴', label: 'High' },
    medium: { icon: '🟡', label: 'Medium' },
    low: { icon: '🟢', label: 'Low' },
    not_relevant: { icon: '⚪', label: 'Not relevant' },
  }[item.priority];

  const handleClose = () => {
    onClose();
    // Focus restore happens in the effect above, but do it eagerly too
    // for environments where effects flush later.
    setTimeout(() => {
      const trigger = triggerRef?.current;
      if (trigger && trigger.isConnected) trigger.focus();
    }, 0);
  };

  return (
    <div className="overlay" role="presentation" onClick={handleClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Why: ${item.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-head">
          <h2>Why this?</h2>
          <button ref={closeRef} type="button" className="link-btn" onClick={handleClose}>
            Close
          </button>
        </div>

        <dl className="why-facts">
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
          <div>
            <dt>Category</dt>
            <dd>{item.category}</dd>
          </div>
          <div>
            <dt>Deadline</dt>
            <dd>{item.deadline}</dd>
          </div>
        </dl>

        <div className="why-sub">
          <p>{item.requiredAction}</p>
          {item.eligibility.summary ? <p className="muted">{item.eligibility.summary}</p> : null}
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
          {(item.why ?? []).map((w, i) => (
            <li key={i} data-polarity={w.polarity}>
              {w.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
