import { gradePoints } from '../utils/gradeUtils';

export default function GradeBadge({ grade }) {
  const gp = gradePoints(grade);
  return (
    <span className="grade-badge">
      {grade}
      {gp !== null && (
        <span style={{ color: 'var(--text-3)', fontWeight: 500, fontSize: 11 }}>· {gp}</span>
      )}
    </span>
  );
}
