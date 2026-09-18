import { validateProfile } from '../profileValidation';
import type {
  ActionItem,
  Announcement,
  StudentProfile,
  WhyReason,
} from '../types';

export const source = 'mock' as const;

const LATENCY_MS = 350;

const DEMO_STUDENTS: StudentProfile[] = [
  {
    id: 'student-cse',
    name: 'Aarav Sharma (Demo)',
    branch: 'CSE',
    year: 3,
    cgpa: 8.4,
    interests: ['AI', 'ML', 'Internship'],
  },
  {
    id: 'student-ece',
    name: 'Diya Patel (Demo)',
    branch: 'ECE',
    year: 2,
    cgpa: 7.2,
    interests: ['Robotics', 'IoT', 'Hackathon'],
  },
  {
    id: 'student-it',
    name: 'Kabir Singh (Demo)',
    branch: 'IT',
    year: 4,
    cgpa: 9.1,
    interests: ['Placement', 'Web Dev', 'Scholarship'],
  },
];

const DEMO_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'AI Internship Opportunity',
    category: 'internship',
    rawText:
      'Students from CSE and IT branches in 3rd year with CGPA above 8.0 are eligible for the AI internship program. Matches interests: AI, ML. Registration closes soon — deadline within 3 days. Required action: Register on the placement portal.',
    deadline: 'In 3 days',
    requiredAction: 'Register on the placement portal',
    action: 'Register on the placement portal',
    eligibleBranches: ['CSE', 'IT'],
    eligibleYears: [3],
    minCgpa: 8.0,
  },
  {
    id: 'ann-2',
    title: 'ML Workshop',
    category: 'workshop',
    rawText:
      'Two-day hands-on ML Workshop open to all branches (CSE, IT, ECE, ME), years 2-4. No CGPA cutoff. Matches interests: ML, AI. Required action: Enroll before seats fill (deadline in 7 days).',
    deadline: 'In 7 days',
    requiredAction: 'Enroll before seats fill',
    action: 'Enroll before seats fill',
    eligibleBranches: [],
    eligibleYears: [2, 3, 4],
  },
  {
    id: 'ann-3',
    title: 'Placement Assessment',
    category: 'placement',
    rawText:
      'Mandatory placement assessment for CSE, IT and ECE branches, years 3-4, minimum CGPA 7.0. Urgent — deadline tomorrow. Required action: Appear for the test with hall ticket.',
    deadline: 'Tomorrow',
    requiredAction: 'Appear for the test with hall ticket',
    action: 'Appear for the test with hall ticket',
    eligibleBranches: ['CSE', 'IT', 'ECE'],
    eligibleYears: [3, 4],
    minCgpa: 7.0,
  },
  {
    id: 'ann-4',
    title: 'Robotics Hackathon',
    category: 'hackathon',
    rawText:
      'Inter-college Robotics Hackathon for ECE and ME branches, all years 1-4. Matches interests: Robotics, IoT. Required action: Form a team of 3 and register (deadline in 7 days).',
    deadline: 'In 7 days',
    requiredAction: 'Form a team of 3 and register',
    action: 'Form a team of 3 and register',
    eligibleBranches: ['ECE', 'ME'],
    eligibleYears: [1, 2, 3, 4],
  },
  {
    id: 'ann-5',
    title: 'Scholarship Renewal',
    category: 'scholarship',
    rawText:
      'Scholarship renewal for all branches with minimum CGPA 8.5. Matches interests: Scholarship. Required action: Submit income certificate and marksheets (deadline in 7 days).',
    deadline: 'In 7 days',
    requiredAction: 'Submit income certificate and marksheets',
    action: 'Submit income certificate and marksheets',
    eligibleBranches: [],
    eligibleYears: [],
    minCgpa: 8.5,
  },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function detectBranches(text: string): string[] {
  const found = new Set<string>();
  const re = /\b(CSE|IT|ECE|EEE|ME|CE|AI|DS)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    found.add(m[1].toUpperCase());
  }
  return [...found];
}

function detectYears(text: string): number[] {
  const found = new Set<number>();
  const yearWord = /([1-5])(?:st|nd|rd|th)?\s*year/gi;
  let m: RegExpExecArray | null;
  while ((m = yearWord.exec(text)) !== null) {
    found.add(Number(m[1]));
  }
  const range = /years?\s*([1-5])\s*[-–]\s*([1-5])/gi;
  while ((m = range.exec(text)) !== null) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    for (let y = Math.min(a, b); y <= Math.max(a, b); y++) found.add(y);
  }
  const list = /years?\s*([1-5](?:\s*,\s*[1-5])+)/gi;
  while ((m = list.exec(text)) !== null) {
    for (const part of m[1].split(',')) {
      const n = Number(part.trim());
      if (n >= 1 && n <= 5) found.add(n);
    }
  }
  return [...found].sort();
}

function detectCgpa(text: string): number | undefined {
  const patterns = [
    /CGPA[^0-9]*([0-9](?:\.[0-9]{1,2})?)/i,
    /([0-9](?:\.[0-9]{1,2})?)\s*CGPA/i,
    /minimum[^0-9]*([0-9](?:\.[0-9]{1,2})?)/i,
    /min\.?[^0-9]*([0-9](?:\.[0-9]{1,2})?)/i,
    /above[^0-9]*([0-9](?:\.[0-9]{1,2})?)/i,
  ];
  for (const re of patterns) {
    const m = re.exec(text);
    if (m) {
      const v = Number(m[1]);
      if (v >= 0 && v <= 10) return v;
    }
  }
  return undefined;
}

function detectCategory(title: string, text: string): string {
  const bracket = /\[([^\]]+)\]/.exec(title);
  if (bracket) return bracket[1].trim().toLowerCase();
  const hay = `${title} ${text}`.toLowerCase();
  for (const kw of [
    'internship',
    'workshop',
    'placement',
    'hackathon',
    'scholarship',
    'exam',
    'seminar',
    'fest',
    'assessment',
  ]) {
    if (hay.includes(kw)) return kw;
  }
  return 'general';
}

function detectAction(text: string): string {
  const m = /required action\s*:\s*([^\n.]+)/i.exec(text);
  if (m) return m[1].trim();
  const verbs = ['register', 'enroll', 'apply', 'submit', 'appear', 'attend', 'fill', 'pay'];
  for (const v of verbs) {
    const re = new RegExp(`\\b${v}\\b[^\\n.]{0,80}`, 'i');
    const hit = re.exec(text);
    if (hit) {
      const s = hit[0].trim();
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
  }
  return 'Read and act as needed';
}

function detectDeadline(text: string): string {
  const lower = text.toLowerCase();
  if (/(tomorrow|within 24 hours|24 hours|closing soon|closes soon|urgent)/.test(lower))
    return 'Tomorrow';
  if (/(within 3 days|in 3 days|3 days)/.test(lower)) return 'In 3 days';
  if (/(within 7 days|in 7 days|7 days|this week|one week)/.test(lower))
    return 'In 7 days';
  const date = /(\d{1,2}[\s/-](?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s/-]?\d{2,4}|\d{4}-\d{2}-\d{2})/i.exec(text);
  if (date) return date[1];
  return 'See announcement text';
}

/** Split pasted text back into announcements (inverse of App.sampleText). */
export function parseAnnouncementText(input: string): Announcement[] {
  const chunks = input
    .split(/\n\s*---\s*\n/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  if (chunks.length === 0) return [];

  return chunks.map((chunk, i) => {
    const lines = chunk.split('\n');
    const first = (lines[0] ?? '').trim();
    let title = first.slice(0, 120) || `Announcement ${i + 1}`;
    let rawText = chunk;
    const bracket = /^(.*?)\s*\[([^\]]+)\]\s*$/.exec(first);
    if (bracket && lines.length > 1) {
      title = bracket[1].trim() || title;
      rawText = lines.slice(1).join('\n').trim() || chunk;
    } else if (lines.length > 1 && first.length < 140) {
      title = first;
      rawText = lines.slice(1).join('\n').trim();
    }
    const combined = `${title}\n${rawText}`;
    const category = detectCategory(title, rawText);
    return {
      id: `parsed-${i + 1}`,
      title,
      category,
      rawText,
      deadline: detectDeadline(combined),
      requiredAction: detectAction(combined),
      action: detectAction(combined),
      eligibleBranches: detectBranches(combined),
      eligibleYears: detectYears(combined),
      minCgpa: detectCgpa(combined),
    };
  });
}

export function personalizeQueue(
  student: StudentProfile,
  announcements: Announcement[],
): ActionItem[] {
  const items: ActionItem[] = announcements.map((a, index) => {
    const hay = `${a.title} ${a.rawText}`.toLowerCase();
    const reasons: WhyReason[] = [];
    let score = 0;

    const branches = a.eligibleBranches ?? detectBranches(hay);
    if (branches.length > 0) {
      if (branches.includes(student.branch.toUpperCase())) {
        score += 30;
        reasons.push({ label: `Branch eligible (${student.branch})`, polarity: 'positive' });
      } else {
        reasons.push({
          label: `Branch not eligible (needs ${branches.join('/')}, you are ${student.branch})`,
          polarity: 'negative',
        });
        return buildItem(a, index, 'low', 'not_eligible', 'Not eligible for your branch', reasons, student);
      }
    }

    const years = a.eligibleYears ?? detectYears(hay);
    if (years.length > 0) {
      if (years.includes(student.year)) {
        score += 20;
        reasons.push({ label: `Year eligible (year ${student.year})`, polarity: 'positive' });
      } else {
        reasons.push({
          label: `Year not eligible (needs year ${years.join('/')})`,
          polarity: 'negative',
        });
        return buildItem(a, index, 'low', 'not_eligible', 'Not eligible for your year', reasons, student);
      }
    }

    const minCgpa = a.minCgpa ?? detectCgpa(hay);
    if (minCgpa !== undefined) {
      if (student.cgpa >= minCgpa) {
        score += 20;
        reasons.push({ label: `CGPA requirement met (${student.cgpa} ≥ ${minCgpa})`, polarity: 'positive' });
      } else {
        reasons.push({
          label: `CGPA requirement not met (${student.cgpa} < ${minCgpa})`,
          polarity: 'negative',
        });
        return buildItem(a, index, 'low', 'not_eligible', 'CGPA below cutoff', reasons, student);
      }
    }

    let interestHit = false;
    for (const interest of student.interests) {
      const key = interest.toLowerCase();
      if (key.length >= 2 && (hay.includes(key) || a.category.toLowerCase().includes(key) || key.includes(a.category.toLowerCase()))) {
        score += 15;
        reasons.push({ label: `Matches your interest in ${interest}`, polarity: 'positive' });
        interestHit = true;
        break;
      }
    }
    if (!interestHit) {
      reasons.push({ label: 'No direct interest match', polarity: 'neutral' });
    }

    if (/(tomorrow|within 24 hours|24 hours|urgent|closing soon)/.test(hay)) {
      score += 30;
      reasons.push({ label: 'Deadline within 24 hours', polarity: 'positive' });
    } else if (/(within 3 days|in 3 days|3 days)/.test(hay)) {
      score += 20;
      reasons.push({ label: 'Deadline within 3 days', polarity: 'positive' });
    } else if (/(within 7 days|in 7 days|7 days|this week)/.test(hay)) {
      score += 10;
      reasons.push({ label: 'Deadline within 7 days', polarity: 'neutral' });
    }

    let priority: ActionItem['priority'];
    if (score >= 60) priority = 'high';
    else if (score >= 35) priority = 'medium';
    else if (score >= 20) priority = 'low';
    else priority = 'not_relevant';

    let status: ActionItem['eligibility']['status'] = 'eligible';
    let summary = 'Eligible for this action';
    if (priority === 'not_relevant' || priority === 'low') {
      status = priority === 'not_relevant' ? 'not_eligible' : 'action_optional';
      summary = priority === 'not_relevant' ? 'Not relevant to your profile' : 'Optional for your profile';
    }

    return buildItem(a, index, priority, status, summary, reasons, student);
  });

  const rank: Record<string, number> = { high: 0, medium: 1, low: 2, not_relevant: 3 };
  return [...items].sort((x, y) => rank[x.priority] - rank[y.priority]);
}

function buildItem(
  a: Announcement,
  index: number,
  priority: ActionItem['priority'],
  status: ActionItem['eligibility']['status'],
  summary: string,
  why: WhyReason[],
  student: StudentProfile,
): ActionItem {
  const action = a.requiredAction ?? a.action ?? detectAction(`${a.title}\n${a.rawText}`);
  void student;
  return {
    id: `item-${a.id || index}`,
    announcementId: a.id,
    title: a.title,
    priority,
    category: a.category,
    deadline: a.deadline ?? detectDeadline(`${a.title}\n${a.rawText}`),
    requiredAction: action,
    eligibility: { status, summary },
    why: why.length > 0 ? why : [{ label: summary, polarity: 'neutral' }],
  };
}

export interface ProcessResult {
  announcements: Announcement[];
  queue: ActionItem[];
}

export async function processAnnouncements(
  inputText: string,
  student: StudentProfile,
): Promise<ProcessResult> {
  const validation = validateProfile(student);
  if (!validation.valid) {
    throw new Error('Fix your profile first before processing.');
  }
  if (!inputText || inputText.trim().length < 20) {
    throw new Error('Enter at least 20 characters to process.');
  }
  await delay(LATENCY_MS);
  const announcements = parseAnnouncementText(inputText);
  if (announcements.length === 0) {
    throw new Error('No announcements found in the pasted text.');
  }
  return { announcements, queue: personalizeQueue(student, announcements) };
}

export async function listStudents(): Promise<StudentProfile[]> {
  await delay(120);
  return DEMO_STUDENTS.map((s) => ({ ...s, interests: [...s.interests] }));
}

export async function listAnnouncements(): Promise<Announcement[]> {
  await delay(120);
  return DEMO_ANNOUNCEMENTS.map((a) => ({ ...a }));
}

export const announcementService = {
  source,
  listStudents,
  listAnnouncements,
  processAnnouncements,
  personalizeQueue,
  parseAnnouncementText,
};
