import type { StudentProfile } from './types';

export interface FieldErrors {
  name: string;
  branch: string;
  year: string;
  cgpa: string;
}

export interface ProfileValidation {
  valid: boolean;
  errors: FieldErrors;
}

const VALID_BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'AI', 'DS'];

export function validateProfile(profile: StudentProfile): ProfileValidation {
  const errors: FieldErrors = { name: '', branch: '', year: '', cgpa: '' };

  if (!profile.name || profile.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }
  if (!profile.branch || profile.branch.trim().length === 0) {
    errors.branch = 'Branch is required.';
  } else if (!VALID_BRANCHES.includes(profile.branch.trim().toUpperCase())) {
    errors.branch = `Branch must be one of: ${VALID_BRANCHES.join(', ')}.`;
  }
  if (!Number.isInteger(profile.year) || profile.year < 1 || profile.year > 5) {
    errors.year = 'Year must be an integer between 1 and 5.';
  }
  if (
    typeof profile.cgpa !== 'number' ||
    Number.isNaN(profile.cgpa) ||
    profile.cgpa < 0 ||
    profile.cgpa > 10
  ) {
    errors.cgpa = 'CGPA must be a number between 0 and 10.';
  }

  const valid =
    errors.name === '' &&
    errors.branch === '' &&
    errors.year === '' &&
    errors.cgpa === '';

  return { valid, errors };
}

export function firstProfileError(validation: ProfileValidation): string | null {
  if (validation.valid) return null;
  return (
    validation.errors.name ||
    validation.errors.branch ||
    validation.errors.year ||
    validation.errors.cgpa ||
    null
  );
}
