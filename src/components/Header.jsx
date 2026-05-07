import { computeCGPA, performanceLabel } from '../utils/gradeUtils';

export default function Header({ semesters, user, onLogout, onShare }) {
  const { cgpa } = computeCGPA(semesters.length ? semesters : [{ courses: [], repeatCourses: [] }]);
  const perf = performanceLabel(cgpa);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <span className="topbar-logo">cgpa<span>.</span>track</span>
        <div className="topbar-divider" />
        {user && (
          <span className="topbar-sub">
            <strong style={{ color: 'var(--text-1)', fontWeight: 700 }}>{user.name}</strong>
            <span style={{ color: 'var(--text-3)' }}> · {user.email}</span>
          </span>
        )}
      </div>

      <div className="topbar-right">
        {semesters.length > 0 && (
          <span className="perf-tag">{perf.label}</span>
        )}

        {/* Share button */}
        {onShare && (
          <button
            onClick={onShare}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 'var(--r-sm)',
              border: '1px solid var(--border)', background: 'var(--white)',
              color: 'var(--text-2)', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--white)'; e.currentTarget.style.color = 'var(--text-2)'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>
        )}

        {/* CGPA chip */}
        {semesters.length > 0 && (
          <div className="cgpa-chip">
            <span className="cgpa-chip-label">CGPA</span>
            <span className="cgpa-chip-value">{cgpa.toFixed(2)}</span>
          </div>
        )}

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              padding: '5px 12px', borderRadius: 'var(--r-sm)',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-3)', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.borderColor = 'var(--text-1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
