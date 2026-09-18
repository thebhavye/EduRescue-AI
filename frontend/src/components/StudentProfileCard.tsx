import { useEffect, useState } from 'react';
import { validateProfile, type FieldErrors } from '../profileValidation';
import type { StudentProfile } from '../types';

interface Props {
  student: StudentProfile;
  onChange: (patch: Partial<StudentProfile>) => void;
  onValidityChange?: (valid: boolean, errors: FieldErrors) => void;
}

export function StudentProfileCard({ student, onChange, onValidityChange }: Props) {
  const [name, setName] = useState(student.name);
  const [branch, setBranch] = useState(student.branch);
  const [year, setYear] = useState(String(student.year));
  const [cgpa, setCgpa] = useState(String(student.cgpa));

  // Reset drafts when switching profiles.
  useEffect(() => {
    setName(student.name);
    setBranch(student.branch);
    setYear(String(student.year));
    setCgpa(String(student.cgpa));
  }, [student.id, student.name, student.branch, student.year, student.cgpa]);

  const draft: StudentProfile = {
    ...student,
    name,
    branch,
    year: Number(year),
    cgpa: Number(cgpa),
  };
  const validation = validateProfile({
    ...draft,
    year: year.trim() === '' ? NaN as unknown as number : Number(year),
    cgpa: cgpa.trim() === '' ? NaN as unknown as number : Number(cgpa),
  });

  useEffect(() => {
    onValidityChange?.(validation.valid, validation.errors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validation.valid, validation.errors.name, validation.errors.branch, validation.errors.year, validation.errors.cgpa]);

  const commit = () => {
    if (!validation.valid) return;
    onChange({
      name: name.trim(),
      branch: branch.trim().toUpperCase(),
      year: Number(year),
      cgpa: Number(cgpa),
    });
  };

  const dirty =
    name !== student.name ||
    branch !== student.branch ||
    year !== String(student.year) ||
    cgpa !== String(student.cgpa);

  return (
    <section className="card" aria-labelledby="profile-card-heading">
      <h2 id="profile-card-heading">Profile details</h2>
      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="profile-name">Name</label>
          <input
            id="profile-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {validation.errors.name ? <p className="field-error" role="alert">{validation.errors.name}</p> : null}
        </div>
        <div>
          <label className="field-label" htmlFor="profile-branch">Branch</label>
          <input
            id="profile-branch"
            className="input"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />
          {validation.errors.branch ? <p className="field-error" role="alert">{validation.errors.branch}</p> : null}
        </div>
        <div>
          <label className="field-label" htmlFor="profile-year">Year</label>
          <input
            id="profile-year"
            className="input"
            inputMode="numeric"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          {validation.errors.year ? <p className="field-error" role="alert">{validation.errors.year}</p> : null}
        </div>
        <div>
          <label className="field-label" htmlFor="profile-cgpa">CGPA</label>
          <input
            id="profile-cgpa"
            className="input"
            inputMode="decimal"
            value={cgpa}
            onChange={(e) => setCgpa(e.target.value)}
          />
          {validation.errors.cgpa ? <p className="field-error" role="alert">{validation.errors.cgpa}</p> : null}
        </div>
      </div>
      <p className="muted small">Interests: {student.interests.join(', ')}</p>
      <button
        type="button"
        className="btn btn-secondary btn-block"
        disabled={!dirty || !validation.valid}
        onClick={commit}
      >
        Save profile
      </button>
    </section>
  );
}
