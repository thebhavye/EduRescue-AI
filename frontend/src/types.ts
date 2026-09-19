export interface Announcement {
  id: string;
  title: string;
  category: string;
  rawText: string;
  deadline?: string;
  requiredAction?: string;
  /** Legacy/test-compat fields — mock service may populate these. */
  action?: string;
  requirements?: Record<string, unknown>;
  eligibleBranches?: string[];
  eligibleYears?: number[];
  minCgpa?: number;
}

export type Priority = 'high' | 'medium' | 'low' | 'not_relevant';

export interface WhyReason {
  label: string;
  polarity: 'positive' | 'negative' | 'neutral';
}

export interface ActionItem {
  id: string;
  announcementId?: string;
  title: string;
  priority: Priority;
  category: string;
  deadline: string;
  requiredAction: string;
  eligibility: {
    status: 'eligible' | 'not_eligible' | 'action_optional';
    summary?: string;
  };
  why?: WhyReason[];
}

export interface StudentProfile {
  id: string;
  name: string;
  branch: string;
  year: number;
  cgpa: number;
  interests: string[];
}

export type ProcessingStatus = 'idle' | 'ready' | 'processing' | 'success' | 'error';
