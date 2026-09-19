import { useRef, useState } from 'react';
import type { Announcement } from '../types';
import { SafeSpecularButton } from './SpecularButton/SafeSpecularButton';

interface Props {
  announcements: Announcement[];
  value: string;
  status: 'idle' | 'ready' | 'processing' | 'success' | 'error';
  error: string | null;
  profileValid: boolean;
  profileMessage: string | null;
  onChange: (text: string) => void;
  onProcess: () => void;
  onUseSample: () => void;
}

const ACCEPTED_EXTENSIONS = ['.txt', '.md'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MiB

export function AnnouncementInput({
  announcements,
  value,
  status,
  error,
  profileValid,
  profileMessage,
  onChange,
  onProcess,
  onUseSample,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileReadIdRef = useRef(0);

  async function readFileText(file: File): Promise<string> {
    if (typeof file.text === 'function') return file.text();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () =>
        reject(reader.error ?? new Error('Could not read file.'));
      reader.readAsText(file);
    });
  }

  async function handleFile(file: File | undefined) {
    setFileError(null);
    if (!file) return;
    const lower = file.name.toLowerCase();
    const ok = ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
    if (!ok) {
      setFileError('Only .txt and .md files are supported in this demo.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)} MiB.`);
      return;
    }
    const currentReadId = ++fileReadIdRef.current;
    try {
      const text = await readFileText(file);
      if (fileReadIdRef.current !== currentReadId) return;
      setFileName(file.name);
      onChange(text);
    } catch {
      if (fileReadIdRef.current !== currentReadId) return;
      setFileError(
        `Could not read "${file.name}". Try pasting the text instead.`,
      );
    }
  }

  const charCount = value.trim().length;
  const canProcess =
    profileValid && status !== 'processing' && charCount >= 20;

  return (
    <section className="card input-card" id="announcements" aria-labelledby="input-heading">
      <div className="card-head">
        <h2 id="input-heading">Announcements</h2>
        <button
          type="button"
          className="link-btn"
          onClick={onUseSample}
        >
          Load sample set
        </button>
      </div>
      <p className="muted">
        Same {announcements.length} announcements for every student. Paste text
        or upload a <code>.txt</code>/<code>.md</code> file, then process.
      </p>

      <label className="field-label" htmlFor="announcement-text">
        Announcement text
      </label>
      <textarea
        id="announcement-text"
        className="textarea"
        rows={8}
        placeholder="Paste announcements here… e.g. AI Internship, ML Workshop, Placement Assessment…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <div className="input-row">
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,text/plain,text/markdown"
          className="visually-hidden"
          aria-label="Upload a .txt or .md announcement file"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fileRef.current?.click()}
        >
          Upload .txt / .md
        </button>
        <span className="muted small" aria-live="polite">
          {fileName ? `Loaded: ${fileName}` : 'PDF/OCR not supported'}
        </span>
        <span className="char-count" aria-live="polite">
          {charCount} chars
        </span>
      </div>

      {fileError ? (
        <p className="alert alert-error" role="alert">
          {fileError}
        </p>
      ) : null}
      {error ? (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      ) : null}
      {profileMessage ? (
        <p className="alert alert-error" role="alert">
          {profileMessage}
        </p>
      ) : null}
      {status === 'success' && profileValid ? (
        <p className="alert alert-success" role="status">
          Personalized queue ready below.
        </p>
      ) : null}

      <SafeSpecularButton
        type="button"
        className="specular-block"
        disabled={!canProcess}
        onClick={onProcess}
        size="lg"
        radius={18}
        tint="#6D4AFF"
        tintOpacity={1}
        blur={0}
        textColor="#ffffff"
        lineColor="#ffffff"
        baseColor="#4c1d95"
        intensity={1}
        shineSize={10}
        shineFade={40}
        thickness={1}
        speed={0.35}
        followMouse
        proximity={250}
        autoAnimate={false}
      >
        {status === 'processing' ? (
          <span className="btn-loading">
            <span className="spinner" aria-hidden="true" />
            Processing…
          </span>
        ) : (
          'Process Announcement'
        )}
      </SafeSpecularButton>
      {!canProcess && status !== 'processing' ? (
        <p className="muted small">
          {!profileValid
            ? 'Fix the student profile above to enable processing.'
            : 'Enter at least 20 characters to enable processing.'}
        </p>
      ) : null}
    </section>
  );
}