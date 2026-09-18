import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { WhyPanel } from './WhyPanel';
import { useState } from 'react';
import type { ActionItem } from '../types';

const mockItem: ActionItem = {
  id: 'item-1',
  announcementId: 'ann-1',
  title: 'Test Announcement',
  category: 'Test',
  priority: 'high',
  deadline: 'Today',
  requiredAction: 'Do something',
  eligibility: { status: 'eligible', summary: 'Eligible' },
  why: [
    { label: 'Reason 1', polarity: 'positive' },
    { label: 'Reason 2', polarity: 'negative' },
  ],
};

function TestHarness() {
  const [item, setItem] = useState<ActionItem | null>(null);
  const triggerRef = { current: null as HTMLButtonElement | null };
  const onClose = vi.fn(() => setItem(null));
  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        data-testid="trigger-button"
        onClick={() => setItem(mockItem)}
      >
        Why this?
      </button>
      <WhyPanel item={item} onClose={onClose} triggerRef={triggerRef} />
    </div>
  );
}

describe('WhyPanel focus restoration', () => {
  it('opens dialog and focuses close button', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);
    const triggerButton = screen.getByTestId('trigger-button');

    await user.click(triggerButton);
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    const closeButton = screen.getByRole('button', { name: /Close/i });
    expect(closeButton).toHaveFocus();
  });

  it('restores focus to trigger button when closed via close button', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);
    const triggerButton = screen.getByTestId('trigger-button');

    await user.click(triggerButton);
    await screen.findByRole('dialog');
    const closeButton = screen.getByRole('button', { name: /Close/i });
    await user.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(triggerButton).toHaveFocus();
  });

  it('restores focus to trigger button when closed via Escape', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);
    const triggerButton = screen.getByTestId('trigger-button');

    await user.click(triggerButton);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(triggerButton).toHaveFocus();
  });

  it('handles stale trigger element gracefully (element removed)', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<TestHarness />);
    const triggerButton = screen.getByTestId('trigger-button');

    await user.click(triggerButton);
    await screen.findByRole('dialog');

    // Remove the trigger button from DOM (simulating profile switch)
    unmount();

    // Close dialog - should not throw
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not restore focus to stale element after profile switch', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<TestHarness />);
    const triggerButton = screen.getByTestId('trigger-button');

    await user.click(triggerButton);
    await screen.findByRole('dialog');

    // Close the dialog (simulating profile switch)
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Re-render with new trigger (simulating new profile's queue)
    function NewTestHarness() {
      const [item, setItem] = useState<ActionItem | null>(null);
      const triggerRef = { current: null as HTMLButtonElement | null };
      const onClose = vi.fn(() => setItem(null));
      return (
        <div>
          <button
            ref={triggerRef}
            type="button"
            data-testid="new-trigger-button"
            onClick={() => setItem(mockItem)}
          >
            Why this?
          </button>
          <WhyPanel item={item} onClose={onClose} triggerRef={triggerRef} />
        </div>
      );
    }

    unmount();
    render(<NewTestHarness />);
    const newTriggerButton = screen.getByTestId('new-trigger-button');
    await user.click(newTriggerButton);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(newTriggerButton).toHaveFocus();
  });
});