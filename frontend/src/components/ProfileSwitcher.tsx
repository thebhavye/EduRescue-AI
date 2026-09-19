import type { StudentProfile } from '../types';

interface Props {
  students: StudentProfile[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ProfileSwitcher({ students, selectedId, onSelect }: Props) {
  return (
    <section className="card" id="profile" aria-labelledby="profile-switcher-heading">
      <h2 id="profile-switcher-heading">Student profile</h2>
      <label className="field-label" htmlFor="profile-select">
        Active profile
      </label>
      <select
        id="profile-select"
        className="select"
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
      >
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} · {s.branch} · Year {s.year}
          </option>
        ))}
      </select>
      <div className="switcher-buttons" role="group" aria-label="Switch profile">
        {students.map((s) => (
          <button
            key={s.id}
            type="button"
            className={s.id === selectedId ? 'btn btn-primary btn-small' : 'btn btn-secondary btn-small'}
            aria-pressed={s.id === selectedId}
            onClick={() => onSelect(s.id)}
          >
            {s.name.replace(' (Demo)', '')}
          </button>
        ))}
      </div>
    </section>
  );
}
