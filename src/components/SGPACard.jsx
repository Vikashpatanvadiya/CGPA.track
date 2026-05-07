import { computeSGPA, performanceLabel } from '../utils/gradeUtils';

export default function SGPACard({ semester }) {
  const { sgpa, pts, earned, registered } = computeSGPA(semester);
  const perf = performanceLabel(sgpa);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Semester Result</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)' }}>
          {perf.label}
        </span>
      </div>
      <div className="card-body">
        <div className="stat-grid">
          {[
            { label: 'SGPA',         value: sgpa.toFixed(2), accent: true },
            { label: 'Registered',   value: registered },
            { label: 'Earned',       value: earned },
            { label: 'Grade Points', value: pts },
          ].map(s => (
            <div key={s.label} className={`stat-item${s.accent ? ' accent' : ''}`}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={s.accent ? {} : { fontSize: 18 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
