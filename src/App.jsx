import { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import SemesterTabs from './components/SemesterTabs';
import SemesterView from './components/SemesterView';
import CGPASummary from './components/CGPASummary';
import GradePredictor from './components/GradePredictor';
import AuthPage from './components/AuthPage';
import ShareView from './components/ShareView';
import { INITIAL_SEMESTERS } from './data/initialData';
import { fetchSemesters, saveSemesters } from './services/api';
import React from 'react';

const STORAGE_KEY = 'cgpa_tracker_v1';

function getShareToken() {
  const m = window.location.pathname.match(/^\/share\/(.+)$/);
  return m ? m[1] : null;
}
function loadLocal() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function loadUser() {
  try { const r = localStorage.getItem('cgpa_user'); return r ? JSON.parse(r) : null; } catch { return null; }
}

export default function App() {
  const shareToken = getShareToken();
  if (shareToken) return <ShareView token={shareToken} />;
  return (
    <ErrorBoundary>
      <AuthenticatedApp />
    </ErrorBoundary>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Inter, system-ui, sans-serif', padding: 24,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#191919', marginBottom: 8 }}>
            cgpa<span style={{ color: '#999' }}>.track</span>
          </div>
          <div style={{ fontSize: 13, color: '#dc2626', marginBottom: 16, textAlign: 'center', maxWidth: 400 }}>
            Something went wrong: {this.state.error.message}
          </div>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{
              padding: '8px 20px', background: '#191919', color: '#fff',
              border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Clear data &amp; reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AuthenticatedApp() {
  const [user,        setUser]        = useState(() => loadUser());
  const [semesters,   setSemesters]   = useState([]);
  const [activeSemId, setActiveSemId] = useState(null);
  const [view,        setView]        = useState('semester');
  const [dbState,     setDbState]     = useState('idle');
  const [appReady,    setAppReady]    = useState(false); // ← prevents blank flash
  const [shareModal,  setShareModal]  = useState(false);
  const saveTimer    = useRef(null);
  const isFirstSave  = useRef(true);

  // ── Load data when user logs in ───────────────────────────────
  useEffect(() => {
    if (!user) { setAppReady(false); return; }

    setDbState('loading');
    setAppReady(false);

    fetchSemesters()
      .then(data => {
        if (data && data.length > 0) {
          // User has data in DB
          setSemesters(data);
          setActiveSemId(data[0].id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          isFirstSave.current = true;
          setDbState('idle');
          setAppReady(true);
        } else {
          // First login — seed with initial data and save to DB
          const seed = loadLocal() || INITIAL_SEMESTERS;
          setSemesters(seed);
          setActiveSemId(seed[0].id);
          saveSemesters(seed)
            .then(() => {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
              isFirstSave.current = true;
              setDbState('idle');
              setAppReady(true);
            })
            .catch(() => {
              setDbState('error');
              setAppReady(true);
            });
        }
      })
      .catch(() => {
        // DB unreachable — use local data
        const local = loadLocal() || INITIAL_SEMESTERS;
        setSemesters(local);
        setActiveSemId(local[0].id);
        isFirstSave.current = true;
        setDbState('error');
        setAppReady(true);
      });
  }, [user]);

  // ── Auto-save on changes (debounced 800ms) ────────────────────
  useEffect(() => {
    if (!user || !appReady || !semesters.length) return;

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(semesters)); } catch {}

    // Skip the very first render after load (data just came from DB)
    if (isFirstSave.current) { isFirstSave.current = false; return; }

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setDbState('saving');
      saveSemesters(semesters)
        .then(() => { setDbState('saved'); setTimeout(() => setDbState('idle'), 2000); })
        .catch(() => setDbState('error'));
    }, 800);

    return () => clearTimeout(saveTimer.current);
  }, [semesters, user, appReady]);

  // ── Auth ──────────────────────────────────────────────────────
  function handleAuth(u) {
    setUser(u);
    setSemesters([]);
    setActiveSemId(null);
    isFirstSave.current = true;
  }

  function handleLogout() {
    clearTimeout(saveTimer.current);
    localStorage.removeItem('cgpa_token');
    localStorage.removeItem('cgpa_user');
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setSemesters([]);
    setActiveSemId(null);
    setAppReady(false);
  }

  // ── Semester actions (hooks must be before any early returns) ─
  const updateSemester = useCallback(updated =>
    setSemesters(p => p.map(s => s.id === updated.id ? updated : s)), []);

  // ── Not logged in ─────────────────────────────────────────────
  if (!user) return <AuthPage onAuth={handleAuth} />;

  // ── Loading state ─────────────────────────────────────────────
  if (!appReady) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif", background: '#fff',
        gap: 12,
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#191919' }}>
          cgpa<span style={{ color: '#999' }}>.track</span>
        </div>
        <div style={{ fontSize: 13, color: '#999' }}>Loading your data…</div>
        <div style={{
          width: 120, height: 3, background: '#f1f1ef', borderRadius: 10, overflow: 'hidden', marginTop: 4,
        }}>
          <div style={{
            height: '100%', width: '40%', background: '#191919', borderRadius: 10,
            animation: 'slide 1.2s ease-in-out infinite',
          }} />
        </div>
        <style>{`
          @keyframes slide {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(350%); }
          }
        `}</style>
      </div>
    );
  }

  // ── Semester actions ──────────────────────────────────────────
  const addSemester = () => {
    const newSem = { id: Date.now(), name: `Sem ${semesters.length + 1}`, period: '', courses: [], repeatCourses: [] };
    setSemesters(p => [...p, newSem]);
    setActiveSemId(newSem.id);
    setView('semester');
  };

  const deleteSemester = id => {
    if (semesters.length === 1) return;
    const rest = semesters.filter(s => s.id !== id);
    setSemesters(rest);
    setActiveSemId(rest[rest.length - 1].id);
  };

  const activeSem = semesters.find(s => s.id === activeSemId) || semesters[0];

  const shareUrl = user?.shareToken
    ? `${window.location.origin}/share/${user.shareToken}`
    : null;

  const statusLabel = {
    idle:    '',
    loading: 'Loading…',
    saving:  'Saving…',
    saved:   'Saved ✓',
    error:   'Offline — local only',
  }[dbState];

  const statusColor = {
    idle:    'var(--text-3)',
    loading: 'var(--text-3)',
    saving:  'var(--text-3)',
    saved:   '#16a34a',
    error:   '#d97706',
  }[dbState];

  return (
    <div className="app-shell">
      <Header
        semesters={semesters}
        user={user}
        onLogout={handleLogout}
        onShare={() => setShareModal(true)}
      />

      {/* Nav */}
      <div className="nav-tabs">
        {[
          { key: 'semester',  label: 'Semester View' },
          { key: 'summary',   label: 'Overall Summary' },
          { key: 'predictor', label: 'Grade Predictor' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`nav-tab${view === key ? ' active' : ''}`}
            onClick={() => setView(key)}
          >
            {label}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {statusLabel && (
            <span style={{ fontSize: 11, color: statusColor, transition: 'color 0.3s' }}>
              {statusLabel}
            </span>
          )}
        </div>
      </div>

      {/* Semester tabs */}
      {view === 'semester' && (
        <SemesterTabs
          semesters={semesters}
          activeSemId={activeSemId}
          onSelect={id => { setActiveSemId(id); setView('semester'); }}
          onAdd={addSemester}
        />
      )}

      {/* Page content */}
      <main className="page-content">
        {view === 'semester' && activeSem && (
          <SemesterView
            semester={activeSem}
            onUpdate={updateSemester}
            onDelete={deleteSemester}
          />
        )}
        {view === 'summary'   && <CGPASummary semesters={semesters} />}
        {view === 'predictor' && <GradePredictor />}
      </main>

      <footer className="footer">
        cgpa.track · {user.name} · B.Tech CSE · Neon Postgres
      </footer>

      {shareModal && <ShareModal url={shareUrl} onClose={() => setShareModal(false)} />}
    </div>
  );
}

/* ── Share Modal ─────────────────────────────────────────────── */
function ShareModal({ url, onClose }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, fontFamily: "'Inter', system-ui, sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 10, padding: '28px',
          width: '100%', maxWidth: 440,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#191919', marginBottom: 4 }}>
            Share your results
          </div>
          <div style={{ fontSize: 13, color: '#999' }}>
            Anyone with this link can view your grades — but cannot make changes.
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          background: '#f7f7f5', border: '1px solid #e9e9e7',
          borderRadius: 6, padding: '10px 12px', marginBottom: 16,
        }}>
          <span style={{
            flex: 1, fontSize: 12, color: '#555',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {url}
          </span>
          <button onClick={copy} style={{
            flexShrink: 0, padding: '5px 14px',
            background: copied ? '#191919' : '#fff',
            color: copied ? '#fff' : '#191919',
            border: '1px solid #e9e9e7', borderRadius: 5,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s',
          }}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div style={{
          background: '#f7f7f5', border: '1px solid #e9e9e7',
          borderRadius: 6, padding: '10px 14px', marginBottom: 20,
          fontSize: 12, color: '#555', lineHeight: 1.8,
        }}>
          <div>✓ &nbsp;View-only — no edits possible</div>
          <div>✓ &nbsp;Always shows your latest saved data</div>
          <div>✓ &nbsp;No login required to view</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 20px', background: '#191919', color: '#fff',
            border: 'none', borderRadius: 6,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
