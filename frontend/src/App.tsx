import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ShinyText } from './components/ShinyText';
import { ActionQueue } from './components/ActionQueue';
import { AnnouncementInput } from './components/AnnouncementInput';
import { ProfileSwitcher } from './components/ProfileSwitcher';
import { StudentProfileCard } from './components/StudentProfileCard';
import { WhyPanel } from './components/WhyPanel';
import {
  announcementService,
  personalizeQueue,
} from './services/announcementService';
import { firstProfileError, validateProfile } from './profileValidation';
import type { FieldErrors } from './profileValidation';
import './styles.css';
import { SummaryMetrics } from './components/SummaryMetrics';
import type {
  ActionItem,
  Announcement,
  ProcessingStatus,
  StudentProfile,
} from './types';

function sampleText(announcements: Announcement[]): string {
  return announcements
    .map((a) => `${a.title} [${a.category}]\n${a.rawText}`)
    .join('\n\n---\n\n');
}

export default function App() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [overrides, setOverrides] = useState<
    Record<string, Partial<StudentProfile>>
  >({});
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  // Request token to prevent stale responses from crossing profile boundaries.
  const [requestId, setRequestId] = useState(0);
  const requestIdRef = useRef(requestId);
  // Keep ref in sync with state for stale-response checks.
  useEffect(() => {
    requestIdRef.current = requestId;
  }, [requestId]);
  // Ref to the "Why this?" button that opened the dialog; used to restore focus.
  const whyTriggerRef = useRef<HTMLButtonElement | null>(null);
  // Validity of drafts + committed values, reported by the profile card.
  const [cardValidity, setCardValidity] = useState<{
    valid: boolean;
    errors: FieldErrors;
  }>({
    valid: true,
    errors: { name: '', branch: '', year: '', cgpa: '' },
  });
  const handleCardValidity = useCallback(
    (valid: boolean, errors: FieldErrors) => {
      setCardValidity((prev) =>
        prev.valid === valid &&
        prev.errors.name === errors.name &&
        prev.errors.branch === errors.branch &&
        prev.errors.year === errors.year &&
        prev.errors.cgpa === errors.cgpa
          ? prev
          : { valid, errors },
      );
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, a] = await Promise.all([
          announcementService.listStudents(),
          announcementService.listAnnouncements(),
        ]);
        if (cancelled) return;
        setStudents(s);
        setAnnouncements(a);
        setSelectedId(s[0]?.id ?? '');
        setInputText(sampleText(a));
        setStatus('success');
      } catch (e) {
        if (cancelled) return;
        setBootError(
          e instanceof Error ? e.message : 'Failed to load demo data.',
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const student: StudentProfile | undefined = useMemo(() => {
    const base = students.find((s) => s.id === selectedId);
    if (!base) return undefined;
    return { ...base, ...(overrides[selectedId] ?? {}) };
  }, [students, selectedId, overrides]);

  const patchStudent = useCallback(
    (patch: Partial<StudentProfile>) => {
      // Committed profile changes invalidate any open details panel —
      // Why reasons must never describe a previous profile state.
      setSelectedItem(null);
      setOverrides((prev) => ({
        ...prev,
        [selectedId]: { ...(prev[selectedId] ?? {}), ...patch },
      }));
    },
    [selectedId],
  );

  // Committed-profile validation (draft validity arrives via cardValidity).
  const committedValidation = student ? validateProfile(student) : null;
  const profileValid =
    student !== undefined &&
    cardValidity.valid &&
    (committedValidation?.valid ?? false);
  // Name every failing field (drafts first, then committed values) so the
  // gate message tells the user exactly what to fix.
  const problems: string[] = [];
  if (student) {
    const push = (message: string | null | undefined) => {
      if (message && !problems.includes(message)) problems.push(message);
    };
    push(cardValidity.errors.year);
    push(cardValidity.errors.cgpa);
    push(cardValidity.errors.name);
    push(cardValidity.errors.branch);
    push(firstProfileError(committedValidation ?? validateProfile(student)));
  }
  const profileMessage =
    !student || profileValid || problems.length === 0
      ? null
      : `Fix your profile first: ${problems.join('; ')}`;

  // The queue is DERIVED from the current valid profile during render —
  // never stored across profile changes. Invalid profile ⇒ empty queue
  // (stale results can never masquerade as current ones).
  const queue: ActionItem[] = useMemo(() => {
    if (!student || !profileValid || announcements.length === 0) return [];
    return personalizeQueue(student, announcements);
  }, [student, profileValid, announcements]);

  const handleProcess = useCallback(async () => {
    // Gate: never call the service with an invalid profile or bad input.
    if (!selectedId || !student || !profileValid) return;
    // Increment request token so any in-flight response from a previous
    // student/profile is ignored when it resolves.
    const currentRequestId = requestId + 1;
    setRequestId(currentRequestId);
    setStatus('processing');
    setError(null);
    try {
      // Runs input + profile validation and simulates latency. The mock
      // result matches the derived queue by construction; when the real
      // API lands, its response will feed the queue here instead.
      await announcementService.processAnnouncements(inputText, student);
      // Ignore stale response if request was superseded or student changed.
      if (requestIdRef.current !== currentRequestId || selectedId !== student.id) return;
      setStatus('success');
    } catch (e) {
      if (requestIdRef.current !== currentRequestId || selectedId !== student.id) return;
      setError(e instanceof Error ? e.message : 'Processing failed.');
      setStatus('error');
    }
  }, [inputText, selectedId, student, profileValid, requestId]);

  const handleSelectStudent = useCallback((id: string) => {
    setSelectedId(id);
    setSelectedItem(null);
    // Clear transient processing state (loading/error) when switching profiles
    // so the new student never inherits the previous student's loading/error.
    // Keep 'success' so the derived queue remains visible immediately.
    setStatus((prev) => (prev === 'processing' || prev === 'error' ? 'idle' : prev));
    setError(null);
    setRequestId((prev) => prev + 1);
  }, []);

  const handleOpenWhy = useCallback((item: ActionItem) => {
    // Capture the element that triggered the dialog so focus can be restored.
    whyTriggerRef.current = document.activeElement as HTMLButtonElement | null;
    setSelectedItem(item);
  }, []);

  if (bootError) {
    return (
      <div className="app">
        <main className="container">
          <div className="alert alert-error" role="alert">
            {bootError}
          </div>
        </main>
      </div>
    );
  }

  const studentDisplayName =
    student?.name.replace(' (Demo)', '') || 'student';

  return (
    <div className="app">
      <a className="skip-link" href="#queue-heading">
        Skip to action queue
      </a>
      <header className="hero">
        <div className="container hero-inner">
          <div>
            <p className="eyebrow">EduRescue · Never miss something important</p>
            <ShinyText text="EduRescue" className="hero-heading" speed={2} color="#8892a3" shineColor="#f8fafc" spread={120} />
            <p className="hero-sub">
              Same announcements + different students = different action
              queues. Switch profiles to see personalization in action.
            </p>
          </div>
          <span
            className="demo-badge"
            title="UI is using local mock data until the backend contract lands"
          >
            {announcementService.source === 'mock'
              ? '● Demo mode · mock data'
              : '● Live API'}
          </span>
        </div>
      </header>

      <main className="container layout">
        <div className="side">
          {students.length > 0 ? (
            <ProfileSwitcher
              students={students.map((s) => ({
                ...s,
                ...(overrides[s.id] ?? {}),
              }))}
              selectedId={selectedId}
              onSelect={handleSelectStudent}
            />
          ) : null}
          {student ? (
            <StudentProfileCard
              student={student}
              onChange={patchStudent}
              onValidityChange={handleCardValidity}
            />
          ) : (
            <section className="card" aria-label="Loading profile">
              <div className="skeleton-line short" />
              <div className="skeleton-line" />
            </section>
          )}
          <AnnouncementInput
            announcements={announcements}
            value={inputText}
            status={status}
            error={status === 'error' ? error : null}
            profileValid={profileValid}
            profileMessage={profileMessage}
            onChange={(t) => {
              setInputText(t);
              if (status === 'success' || status === 'error') {
                setStatus(t.trim().length >= 20 ? 'ready' : 'idle');
              }
            }}
            onProcess={() => void handleProcess()}
            onUseSample={() => {
              setInputText(sampleText(announcements));
              setStatus('ready');
              setError(null);
            }}
          />
        </div>

        <div className="main-col">
          <SummaryMetrics queue={queue} />
          {!student ? (
            <section className="card" aria-label="Loading action queue">
              <div className="skeleton-line short" />
              <div className="skeleton-line" />
            </section>
          ) : !profileValid ? (
            <section className="card" aria-labelledby="queue-heading">
              <h2 id="queue-heading">Personalized action queue unavailable</h2>
              <div className="empty">
                <p className="empty-title">Profile needs attention ⚠️</p>
                <p className="muted">
                  {profileMessage} The queue will reappear once the profile
                  is valid — stale results are never shown.
                </p>
              </div>
            </section>
          ) : (
            <ActionQueue
              items={queue}
              status={status}
              studentName={studentDisplayName}
              onOpen={handleOpenWhy}
            />
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p className="muted small">
            Frontend demo only — explanations shown are mock results. Real
            eligibility & priority will come from the backend API.
          </p>
        </div>
      </footer>

      <WhyPanel
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        triggerRef={whyTriggerRef}
      />
    </div>
  );
}