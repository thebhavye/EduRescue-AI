import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AnnouncementInput } from './AnnouncementInput';
import type { Announcement } from '../types';

const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Test Announcement',
    category: 'Test',
    rawText: 'Test',
    action: 'Test',
    deadline: 'Today',
    requirements: {},
  },
];

function setup(props: Partial<{
  announcements: Announcement[];
  value: string;
  status: 'idle' | 'ready' | 'processing' | 'success' | 'error';
  error: string | null;
  profileValid: boolean;
  profileMessage: string | null;
  onChange: (text: string) => void;
  onProcess: () => void;
  onUseSample: () => void;
}> = {}) {
  const onChange = vi.fn(props.onChange);
  const onProcess = vi.fn(props.onProcess);
  const onUseSample = vi.fn(props.onUseSample);
  render(
    <AnnouncementInput
      announcements={props.announcements ?? mockAnnouncements}
      value={props.value ?? ''}
      status={props.status ?? 'idle'}
      error={props.error ?? null}
      profileValid={props.profileValid ?? true}
      profileMessage={props.profileMessage ?? null}
      onChange={onChange}
      onProcess={onProcess}
      onUseSample={onUseSample}
    />,
  );
  return { onChange, onProcess, onUseSample };
}

describe('AnnouncementInput', () => {
  it('accepts valid .txt file and calls onChange with content', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    const file = new File(['Valid announcement text content'], 'notes.txt', {
      type: 'text/plain',
    });
    const uploadInput = screen.getByLabelText(
      /Upload a \.txt or \.md announcement file/i,
    );
    await user.upload(uploadInput, file);
    expect(await screen.findByText(/Loaded: notes\.txt/)).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith('Valid announcement text content');
  });

  it('accepts valid .md file and calls onChange with content', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    const file = new File(
      ['# Markdown announcement content'],
      'notes.md',
      { type: 'text/markdown' },
    );
    const uploadInput = screen.getByLabelText(
      /Upload a \.txt or \.md announcement file/i,
    );
    await user.upload(uploadInput, file);
    expect(await screen.findByText(/Loaded: notes\.md/)).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith('# Markdown announcement content');
  });

  it('rejects oversized .txt file before reading', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    const largeContent = 'x'.repeat(3 * 1024 * 1024); // 3 MiB
    const file = new File([largeContent], 'large.txt', { type: 'text/plain' });
    const uploadInput = screen.getByLabelText(
      /Upload a \.txt or \.md announcement file/i,
    );
    await user.upload(uploadInput, file);
    expect(
      await screen.findByText(/File is too large. Maximum size is 2 MiB\./),
    ).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('rejects oversized .md file before reading', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    const largeContent = 'x'.repeat(3 * 1024 * 1024); // 3 MiB
    const file = new File([largeContent], 'large.md', {
      type: 'text/markdown',
    });
    const uploadInput = screen.getByLabelText(
      /Upload a \.txt or \.md announcement file/i,
    );
    await user.upload(uploadInput, file);
    expect(
      await screen.findByText(/File is too large. Maximum size is 2 MiB\./),
    ).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('latest file selection wins when files selected quickly (race guard)', async () => {
    const user = userEvent.setup();
    const { onChange } = setup();

    // Create two files with different content
    const fileA = new File(['Content from file A'], 'file-a.txt', {
      type: 'text/plain',
    });
    const fileB = new File(['Content from file B'], 'file-b.txt', {
      type: 'text/plain',
    });

    const uploadInput = screen.getByLabelText(
      /Upload a \.txt or \.md announcement file/i,
    );

    // Select file A then quickly select file B
    await user.upload(uploadInput, fileA);
    await user.upload(uploadInput, fileB);

    // Wait for the UI to settle
    await waitFor(() => {
      expect(screen.getByText(/Loaded: file-b\.txt/)).toBeInTheDocument();
    });

    // File B's content should be the one that made it to onChange
    expect(onChange).toHaveBeenLastCalledWith('Content from file B');
    expect(onChange).not.toHaveBeenLastCalledWith('Content from file A');
  });
});