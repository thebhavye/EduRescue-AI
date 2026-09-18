export interface Announcement {
  id: string;
  title: string;
  category: string;
  rawText: string;
  deadline?: string;
  requiredAction?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low' | 'not_relevant';
  category: string;
  deadline: string;
  requiredAction: string;
  eligibility: {
    status: 'eligible' | 'not_eligible' | 'action_optional';
  };
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