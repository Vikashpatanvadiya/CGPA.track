import { useEffect, useState } from 'react';
import { fetchSharedSemesters } from '../services/api';
import { computeSGPA, computeCGPA, gradePoints, performanceLabel } from '../utils/gradeUtils';
import { SGPATrendChart, CreditsBarChart, CGPAProgressBar } from './Charts';

export default function ShareView({ token }) {
  const [data,    setData]    = useState(null);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSemId, setActiveSemId] = useState(null);

  useEffect(() => {
    fetchSharedSemesters(token)
      .then(d => {
        setData(d);
        if (d.semesters?.length) setActiveSemId(d.semesters[0].id);
      })
      .catch(() => setError('This share link is invalid or has expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <CenterMsg>Loading…</CenterMsg>;
  if (error)   return <CenterMsg>{error}</CenterMsg>;

  const { semesters, owner } = data;
  const { cgpa } = computeCGPA(semesters);
  const perf = performanceLabel(cgpa);
  const activeSem = semesters.find(s => s.id === activeSemId) || semesters[0];

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Top bar */}
      <div style={{
        borderBottom: '1px solid #e9e9e7', padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52, position: 'sticky', top: 0, background: '#fff', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#191919' }}>
            cgpa<span style={{ color: '#999' }}>.track</span>
          </span>
          <div style={{ width: 1, height: 16, background: '#e9e9e7' }} />
          <span style={{ fontSize: 12, color: '#999' }}>
            <strong style={{ color: '#191919' }}>{owner.name}</strong>'s results
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, background: '#f7f7f5', border: '1px solid #e9e9e7',
            borderRadius: 4, padding: '3px 10px', color: '#999',
          }}>
            View only
          </span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#191919', borderRadius: 6, padding: '5px 12px',
          }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>CGPA</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{cgpa.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Semester tabs */}
      <div style={{
        borderBottom: '1px solid #e9e9e7', padding: '10px 32px',
        display: 'flex', flexWrap: 'wrap', gap: 6, background: '#fff',
      }}>
        {semesters.map(sem => {
          const { sgpa } = computeSGPA(sem);
          const active = sem.id === activeSemId;
          return (
            <button key={sem.id} onClick={() => setActiveSemId(sem.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 6,
              border: `1px solid ${active ? '#191919' : '#e9e9e7'}`,
              background: active ? '#191919' : '#fff',
              color: active ? '#fff' : '#555',
              fontSize: 13, fontWeight: active ? 600 : 400,
              cursor: 'pointer',
            }}>
              {sem.name}
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
                background: active ? 'rgba(255,255,255,0.15)' : '#f1f1ef',
                color: active ? '#fff' : '#999',
              }}>{sgpa.toFixed(2)}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '28px 28px 64px' }}>

        {/* Semester name */}
        <div style={{ marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid #f1f1ef' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#191919', letterSpacing: '-0.4px' }}>
            {activeSem.name}
          </h2>
          {activeSem.period && (
            <div style={{ fontSize: 12, color: '#999', marginTop: 3 }}>{activeSem.period}</div>
          )}
        </div>

        {/* Course table */}
        <ReadOnlyTable courses={activeSem.courses} title="Regular Courses" />
        {activeSem.repeatCourses.length > 0 && (
          <ReadOnlyTable courses={activeSem.repeatCourses} title="Repeat / Supplementary" />
        )}

        {/* SGPA stats */}
        <SGPAStats semester={activeSem} />

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginTop: 28 }}>
          <CGPAProgressBar cgpa={cgpa} />
          <SGPATrendChart semesters={semesters} />
          <CreditsBarChart semesters={semesters} />
        </div>
      </main>

      <footer style={{
        textAlign: 'center', padding: 14, fontSize: 11, color: '#999',
        borderTop: '1px solid #e9e9e7',
      }}>
        Shared via cgpa.track · View only
      </footer>
    </div>
  );
}

function ReadOnlyTable({ courses, title }) {
  if (!courses.length) return null;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
        {title}
        <span style={{ background: '#f1f1ef', color: '#999', borderRadius: 4, padding: '0 6px', fontSize: 11, fontWeight: 600 }}>{courses.length}</span>
      </div>
      <div style={{ border: '1px solid #e9e9e7', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
          <thead>
            <tr style={{ background: '#f7f7f5', borderBottom: '1px solid #e9e9e7' }}>
              {['#', 'Code', 'Course Title', 'Type', 'Credits', 'Grade', 'Points', 'Load'].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: h === 'Course Title' ? 'left' : 'center', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#999' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((c, i) => {
              const gp   = gradePoints(c.grade);
              const load = gp !== null ? gp * c.credits : '–';
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f1ef' }}>
                  <td style={{ padding: '9px 14px', textAlign: 'center', color: '#999', fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: '9px 14px', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: '#555' }}>{c.code}</td>
                  <td style={{ padding: '9px 14px', color: '#191919' }}>{c.title}</td>
                  <td style={{ padding: '9px 14px', textAlign: 'center' }}>
                    <span style={{ background: '#f1f1ef', color: '#555', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{c.type}</span>
                  </td>
                  <td style={{ padding: '9px 14px', textAlign: 'center', color: '#555' }}>{c.credits}</td>
                  <td style={{ padding: '9px 14px', textAlign: 'center', fontWeight: 700, color: '#191919' }}>{c.grade}</td>
                  <td style={{ padding: '9px 14px', textAlign: 'center' }}>
                    <span style={{ background: '#f1f1ef', border: '1px solid #e9e9e7', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 700, color: '#191919' }}>
                      {gp !== null ? gp : '–'}
                    </span>
                  </td>
                  <td style={{ padding: '9px 14px', textAlign: 'center', fontWeight: 600, color: '#191919' }}>{load}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SGPAStats({ semester }) {
  const { sgpa, pts, earned, registered } = computeSGPA(semester);
  const perf = performanceLabel(sgpa);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, marginTop: 8 }}>
      {[
        { label: 'SGPA', value: sgpa.toFixed(2), dark: true },
        { label: 'Performance', value: perf.label },
        { label: 'Registered', value: registered },
        { label: 'Earned', value: earned },
        { label: 'Grade Points', value: pts },
      ].map(s => (
        <div key={s.label} style={{
          background: s.dark ? '#191919' : '#f7f7f5',
          border: `1px solid ${s.dark ? '#191919' : '#e9e9e7'}`,
          borderRadius: 8, padding: '14px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: s.dark ? 'rgba(255,255,255,0.45)' : '#999', marginBottom: 5 }}>{s.label}</div>
          <div style={{ fontSize: s.dark ? 22 : 18, fontWeight: 800, color: s.dark ? '#fff' : '#191919', lineHeight: 1 }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

function CenterMsg({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif', color: '#999', fontSize: 14 }}>
      {children}
    </div>
  );
}
