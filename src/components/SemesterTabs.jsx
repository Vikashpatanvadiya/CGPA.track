import { computeSGPA } from '../utils/gradeUtils';

export default function SemesterTabs({ semesters, activeSemId, onSelect, onAdd }) {
  return (
    <div className="sem-tabs-bar">
      {semesters.map(sem => {
        const { sgpa } = computeSGPA(sem);
        const active = sem.id === activeSemId;
        return (
          <button
            key={sem.id}
            onClick={() => onSelect(sem.id)}
            className={`sem-tab-btn${active ? ' active' : ''}`}
          >
            <span>{sem.name}</span>
            <span className="sem-tab-sgpa">{sgpa.toFixed(2)}</span>
          </button>
        );
      })}

      <button className="btn-add-sem" onClick={onAdd}>
        <span>+</span>
        <span>Add Semester</span>
      </button>
    </div>
  );
}
