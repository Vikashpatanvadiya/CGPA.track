import { useState, useCallback, useEffect, useRef } from 'react';
import { uid } from '../utils/gradeUtils';
import { COURSE_TYPES } from '../data/initialData';
import { fetchPredictor, savePredictor } from '../services/api';

const THRESHOLDS = [
  { grade: 'A+', points: 10, min: 90,  label: 'Outstanding' },
  { grade: 'A',  points: 9,  min: 80,  label: 'Excellent'   },
  { grade: 'A-', points: 8,  min: 70,  label: 'Very Good'   },
  { grade: 'B+', points: 7,  min: 60,  label: 'Good'        },
  { grade: 'B',  points: 6,  min: 55,  label: 'Above Avg'   },
  { grade: 'B-', points: 5,  min: 50,  label: 'Average'     },
  { grade: 'C',  points: 4,  min: 45,  label: 'Pass'        },
  { grade: 'NI', points: 0,  min: 0,   label: 'Needs Impr.' },
];

function getGrade(pct) {
  for (const t of THRESHOLDS) { if (pct >= t.min) return t; }
  return THRESHOLDS[THRESHOLDS.length - 1];
}

function emptyRow() {
  return { id: uid(), subject: '', type: 'Core', midSem: '', midSemMax: 60, endSemMax: 40 };
}

/* ── Target card ── */
function TargetCard({ target, endMax }) {
  const achieved  = target.alreadyAchieved;
  const possible  = target.achievable && !achieved;
  const impossible = !target.achievable && !achieved;
  const pct = possible ? Math.round((target.needed / endMax) * 100) : null;

  return (
    <div style={{
      border: `1px solid ${achieved ? 'var(--text-1)' : 'var(--border)'}`,
      borderRadius: 'var(--r-md)',
      padding: '10px 12px',
      minWidth: 100, flex: '1 1 100px',
      background: achieved ? 'var(--black)' : 'var(--white)',
      opacity: impossible ? 0.35 : 1,
      transition: 'opacity 0.15s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
        <span style={{ fontSize: 17, fontWeight: 800, color: achieved ? '#fff' : 'var(--text-1)', lineHeight: 1 }}>
          {target.grade}
        </span>
        <span style={{ fontSize: 10, fontWeight: 500, color: achieved ? 'rgba(255,255,255,0.5)' : 'var(--text-3)' }}>
          {target.points} pts
        </span>
      </div>

      {achieved  && <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>✓ Secured</div>}
      {possible  && <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Need <strong style={{ color: 'var(--text-1)' }}>{target.needed}</strong> / {endMax}</div>}
      {impossible && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Not achievable</div>}

      {pct !== null && (
        <div style={{ marginTop: 7, background: 'var(--surface-3)', borderRadius: 10, height: 3, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: 'var(--text-1)', borderRadius: 10, transition: 'width 0.4s ease' }} />
        </div>
      )}
    </div>
  );
}

/* ── Subject row ── */
function SubjectRow({ row, onChange, onDelete }) {
  const mid      = parseFloat(row.midSem)    || 0;
  const midMax   = parseFloat(row.midSemMax) || 60;
  const endMax   = parseFloat(row.endSemMax) || 40;
  const fullMark = midMax + endMax;
  const hasInput = row.midSem !== '';
  const bestGrade = getGrade(((mid + endMax) / fullMark) * 100);

  const targets = THRESHOLDS.slice(0, 7).map(t => {
    const needed = Math.ceil((t.min / 100) * fullMark - mid);
    return { ...t, needed: Math.max(0, needed), achievable: needed <= endMax && needed >= 0, alreadyAchieved: needed <= 0 };
  });

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: 'var(--white)' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 16px', background: 'var(--surface-2)',
        borderBottom: '1px solid var(--border)', flexWrap: 'wrap',
      }}>
        <select
          value={row.type}
          onChange={e => onChange({ ...row, type: e.target.value })}
          style={{
            padding: '3px 8px', borderRadius: 'var(--r-sm)', fontSize: 11, fontWeight: 600,
            border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--text-2)',
            cursor: 'pointer', outline: 'none',
          }}
        >
          {COURSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <input
          value={row.subject}
          onChange={e => onChange({ ...row, subject: e.target.value })}
          placeholder="Subject name…"
          style={{ flex: 1, minWidth: 140, border: 'none', background: 'transparent', fontSize: 14, fontWeight: 600, color: 'var(--text-1)', outline: 'none' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={lbl}>Mid-Sem</span>
          <input type="number" value={row.midSem} min={0} max={midMax}
            onChange={e => onChange({ ...row, midSem: e.target.value })}
            placeholder="–" style={inp(64)} />
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>/</span>
          <input type="number" value={row.midSemMax} min={1}
            onChange={e => onChange({ ...row, midSemMax: Math.max(1, Number(e.target.value)) })}
            style={inp(44)} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={lbl}>End-Sem Max</span>
          <input type="number" value={row.endSemMax} min={1}
            onChange={e => onChange({ ...row, endSemMax: Math.max(1, Number(e.target.value)) })}
            style={inp(52)} />
        </div>

        <button onClick={onDelete} className="btn-delete-row">×</button>
      </div>

      {hasInput ? (
        <div style={{ padding: '14px 16px' }}>
          {/* Summary row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              { label: 'Mid-Sem',      value: `${mid} / ${midMax}` },
              { label: 'Best Possible',value: `${mid + endMax} / ${fullMark}` },
              { label: 'Best Grade',   value: `${bestGrade.grade} · ${bestGrade.points} pts` },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '6px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-3)', marginBottom: 8 }}>
            End-sem marks needed for each grade
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {targets.map(t => <TargetCard key={t.grade} target={t} endMax={endMax} />)}
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px 16px', color: 'var(--text-3)', fontSize: 13, textAlign: 'center' }}>
          Enter your mid-sem marks above to see predictions
        </div>
      )}
    </div>
  );
}

/* ── Quick Calculator ── */
function QuickCalc() {
  const [mid,    setMid]    = useState('');
  const [midMax, setMidMax] = useState(60);
  const [endSem, setEndSem] = useState('');
  const [endMax, setEndMax] = useState(40);

  const midVal   = parseFloat(mid)    || 0;
  const endVal   = parseFloat(endSem) || 0;
  const fullMark = midMax + endMax;
  const total    = midVal + endVal;
  const pct      = fullMark > 0 ? (total / fullMark) * 100 : 0;
  const grade    = getGrade(pct);
  const hasVal   = mid !== '' || endSem !== '';

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 28, background: 'var(--white)' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>Quick Grade Calculator</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Enter marks to instantly see your grade</div>
        </div>
        {hasVal && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>Total</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>
                {total.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-3)' }}> / {fullMark}</span>
              </div>
            </div>
            <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>Grade</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-1)', lineHeight: 1 }}>{grade.grade}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>Points</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>{grade.points}</div>
            </div>
          </div>
        )}
      </div>

      {/* Inputs */}
      <div style={{ padding: '20px 24px', display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <div style={qLbl}>Mid-Sem Marks</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="number" value={mid} min={0} max={midMax}
              onChange={e => setMid(e.target.value)} placeholder="e.g. 43" style={qInp} />
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>out of</span>
            <input type="number" value={midMax} min={1}
              onChange={e => setMidMax(Math.max(1, Number(e.target.value)))} style={{ ...qInp, width: 56 }} />
          </div>
        </div>

        <span style={{ color: 'var(--text-3)', fontSize: 20, paddingBottom: 2 }}>+</span>

        <div>
          <div style={qLbl}>End-Sem Marks</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="number" value={endSem} min={0} max={endMax}
              onChange={e => setEndSem(e.target.value)} placeholder="e.g. 30" style={qInp} />
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>out of</span>
            <input type="number" value={endMax} min={1}
              onChange={e => setEndMax(Math.max(1, Number(e.target.value)))} style={{ ...qInp, width: 56 }} />
          </div>
        </div>
      </div>

      {/* Grade scale strip */}
      <div style={{ padding: '0 24px 16px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {THRESHOLDS.slice(0, 7).map(t => {
          const active = hasVal && grade.grade === t.grade;
          return (
            <div key={t.grade} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: active ? 'var(--black)' : 'var(--surface-2)',
              border: `1px solid ${active ? 'var(--black)' : 'var(--border)'}`,
              borderRadius: 'var(--r-sm)', padding: '3px 9px',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontWeight: 700, fontSize: 12, color: active ? '#fff' : 'var(--text-2)' }}>{t.grade}</span>
              <span style={{ fontSize: 10, color: active ? 'rgba(255,255,255,0.5)' : 'var(--text-3)' }}>≥{t.min}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main ── */
export default function GradePredictor() {
  const [rows,    setRows]    = useState([emptyRow()]);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const saveTimer = useRef(null);
  const isFirstLoad = useRef(true);

  // Load from DB on mount
  useEffect(() => {
    fetchPredictor()
      .then(data => {
        if (data && data.length > 0) setRows(data);
        isFirstLoad.current = false;
      })
      .catch(() => { isFirstLoad.current = false; });
  }, []);

  // Auto-save with 800ms debounce whenever rows change
  useEffect(() => {
    if (isFirstLoad.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaveState('saving');
      savePredictor(rows)
        .then(() => { setSaveState('saved'); setTimeout(() => setSaveState('idle'), 2000); })
        .catch(() => setSaveState('error'));
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [rows]);

  const addRow    = () => setRows(p => [...p, emptyRow()]);
  const updateRow = useCallback((id, updated) => setRows(p => p.map(r => r.id === id ? updated : r)), []);
  const deleteRow = useCallback((id) => setRows(p => p.length > 1 ? p.filter(r => r.id !== id) : p), []);

  const statusLabel = { idle: '', saving: 'Saving…', saved: 'Saved ✓', error: 'Save failed' }[saveState];
  const statusColor = { idle: '', saving: 'var(--text-3)', saved: '#16a34a', error: '#d97706' }[saveState];

  return (
    <div>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.4px' }}>Grade Predictor</h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
            Enter your mid-sem marks to find out what you need in the end-sem for each grade.
          </p>
        </div>
        {statusLabel && (
          <span style={{ fontSize: 11, color: statusColor, marginTop: 4, transition: 'color 0.3s' }}>
            {statusLabel}
          </span>
        )}
      </div>

      <QuickCalc />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Subject-wise Predictor</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Tag each subject as Core, UFP, Elective, or Lab</div>
        </div>
        <button
          onClick={addRow}
          style={{
            padding: '6px 14px', borderRadius: 'var(--r-sm)',
            border: '1px dashed var(--border)',
            background: 'transparent', color: 'var(--text-2)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}
        >
          + Add Subject
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map(row => (
          <SubjectRow key={row.id} row={row}
            onChange={updated => updateRow(row.id, updated)}
            onDelete={() => deleteRow(row.id)} />
        ))}
      </div>

      {/* Grade scale reference */}
      <div style={{ marginTop: 28, border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '18px 20px', background: 'var(--surface-2)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-3)', marginBottom: 12 }}>
          Grading Scale Reference
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {THRESHOLDS.map(t => (
            <div key={t.grade} style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)', padding: '8px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 68,
            }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-1)' }}>{t.grade}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-2)' }}>{t.points} pts</span>
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>≥ {t.min}%</span>
              <span style={{ fontSize: 9, color: 'var(--text-3)' }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const lbl = { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', whiteSpace: 'nowrap' };
const inp = (w = 60) => ({ width: w, padding: '5px 8px', textAlign: 'center', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 700, color: 'var(--text-1)', outline: 'none', background: 'var(--white)' });
const qLbl = { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: 7 };
const qInp = { width: 76, padding: '8px 10px', textAlign: 'center', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', fontSize: 15, fontWeight: 700, color: 'var(--text-1)', outline: 'none', background: 'var(--white)' };
