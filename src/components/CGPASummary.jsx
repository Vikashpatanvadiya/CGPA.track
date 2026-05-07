import { computeCGPA, computeSGPA, performanceLabel } from '../utils/gradeUtils';
import { SGPATrendChart, CreditsBarChart, CGPAProgressBar } from './Charts';

export default function CGPASummary({ semesters }) {
  const { cgpa, totalPts, totalEarned, totalReg } = computeCGPA(semesters);
  const perf = performanceLabel(cgpa);
  const bestSGPA = Math.max(...semesters.map(s => computeSGPA(s).sgpa));

  const topStats = [
    { label: 'CGPA',               value: cgpa.toFixed(2), accent: true },
    { label: 'Performance',        value: perf.label },
    { label: 'Semesters',          value: semesters.length },
    { label: 'Credits Registered', value: totalReg },
    { label: 'Credits Earned',     value: totalEarned },
    { label: 'Grade Points',       value: totalPts },
  ];

  return (
    <div>
      <div className="summary-stats">
        {topStats.map(s => (
          <div key={s.label} className={`stat-item${s.accent ? ' accent' : ''}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={s.accent ? {} : { fontSize: 18 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <CGPAProgressBar cgpa={cgpa} />
        <SGPATrendChart semesters={semesters} />
        <CreditsBarChart semesters={semesters} />

        <div className="card">
          <div className="card-header">
            <span className="card-title">Semester Comparison</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: 18 }}>Semester</th>
                  <th>Courses</th>
                  <th>Credits</th>
                  <th>SGPA</th>
                </tr>
              </thead>
              <tbody>
                {semesters.map(sem => {
                  const s = computeSGPA(sem);
                  const isBest = s.sgpa === bestSGPA;
                  return (
                    <tr key={sem.id}>
                      <td style={{ paddingLeft: 18, fontWeight: 500, color: 'var(--text-1)' }}>
                        {sem.name}
                        {sem.period && (
                          <span style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', fontWeight: 400 }}>
                            {sem.period}
                          </span>
                        )}
                      </td>
                      <td>{sem.courses.length + sem.repeatCourses.length}</td>
                      <td>{s.earned} / {s.registered}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 14 }}>
                          {s.sgpa.toFixed(2)}
                        </span>
                        {isBest && (
                          <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>
                            ↑ best
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
