import { computeCGPA, computeSGPA, performanceLabel } from '../utils/gradeUtils';
import { SGPATrendChart, CreditsBarChart, CGPAProgressBar } from './Charts';
import { COURSE_TYPES } from '../data/initialData';

export default function CGPASummary({ semesters }) {
  const { cgpa, totalPts, totalEarned, totalReg } = computeCGPA(semesters);
  const perf = performanceLabel(cgpa);
  const bestSGPA = semesters.length > 0 ? Math.max(...semesters.map(s => computeSGPA(s).sgpa)) : 0;

  // ── Subject counts ────────────────────────────────────────────
  // Collect all unique courses by code (repeat courses count as one subject)
  const allCourses = semesters.flatMap(s => [...(s.courses || []), ...(s.repeatCourses || [])]);
  const uniqueByCodes = new Map();
  allCourses.forEach(c => {
    if (!uniqueByCodes.has(c.code)) uniqueByCodes.set(c.code, c);
  });
  const uniqueCourses = [...uniqueByCodes.values()];
  const totalSubjects = uniqueCourses.length;

  // Count by type
  const byType = COURSE_TYPES.map(type => ({
    type,
    count: uniqueCourses.filter(c => (c.type || 'Core') === type).length,
  }));

  const topStats = [
    { label: 'CGPA',               value: cgpa.toFixed(2), accent: true },
    { label: 'Performance',        value: perf.label },
    { label: 'Semesters',          value: semesters.length },
    { label: 'Subjects Studied',   value: totalSubjects },
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

      {/* Subject breakdown by type */}
      {totalSubjects > 0 && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-header">
            <span className="card-title">Subjects by Type</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
              {totalSubjects} unique subject{totalSubjects !== 1 ? 's' : ''} across {semesters.length} semester{semesters.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {byType.map(({ type, count }) => (
                <div key={type} style={{
                  flex: '1 1 120px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-md)',
                  padding: '14px 16px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-3)', marginBottom: 6 }}>
                    {type}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>
                    {count}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                    subject{count !== 1 ? 's' : ''}
                  </div>
                  {/* Mini progress bar relative to total */}
                  <div style={{ marginTop: 8, background: 'var(--surface-3)', borderRadius: 10, height: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${totalSubjects > 0 ? (count / totalSubjects) * 100 : 0}%`,
                      height: '100%', background: 'var(--black)', borderRadius: 10,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Subject list */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-3)', marginBottom: 10 }}>
                All Subjects
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {uniqueCourses.map(c => (
                  <div key={c.code} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--white)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)', padding: '4px 10px',
                    fontSize: 12,
                  }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{c.code}</span>
                    <span style={{ color: 'var(--text-2)' }}>{c.title}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      background: 'var(--surface-3)', color: 'var(--text-3)',
                      borderRadius: 3, padding: '1px 5px',
                    }}>{c.type || 'Core'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
