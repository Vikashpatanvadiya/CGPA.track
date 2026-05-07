import { useState } from 'react';
import { GRADE_LABELS, COURSE_TYPES } from '../data/initialData';
import { gradePoints } from '../utils/gradeUtils';
import GradeBadge from './GradeBadge';

function EditableCell({ value, onChange, type = 'text', mono = false, align = 'left' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);

  if (editing) {
    return (
      <input
        autoFocus type={type} value={draft}
        className="editable-input"
        style={{ textAlign: align, fontFamily: mono ? 'monospace' : 'inherit' }}
        onChange={e => setDraft(type === 'number' ? Number(e.target.value) : e.target.value)}
        onBlur={() => { setEditing(false); onChange(draft); }}
        onKeyDown={e => {
          if (e.key === 'Enter')  { setEditing(false); onChange(draft); }
          if (e.key === 'Escape') { setEditing(false); setDraft(value); }
        }}
      />
    );
  }

  return (
    <span
      className="editable-cell"
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Click to edit"
      style={{
        textAlign: align,
        fontFamily: mono ? 'monospace' : 'inherit',
        fontSize: mono ? 12 : 13,
        color: mono ? 'var(--text-2)' : 'var(--text-1)',
        fontWeight: mono ? 500 : 400,
      }}
    >
      {value}
    </span>
  );
}

export default function CourseTable({ courses, onUpdate, onDelete, onAdd, title }) {
  return (
    <div className="table-section">
      <div className="table-section-header">
        <div className="table-section-title">
          {title}
          <span className="count-badge">{courses.length}</span>
        </div>
        <button className="btn-add-course" onClick={onAdd}>+ Add Course</button>
      </div>

      <div className="table-wrap">
        <table className="courses-table">
          <thead>
            <tr>
              <th style={{ width: 36, textAlign: 'center' }}>#</th>
              <th style={{ width: 96 }}>Code</th>
              <th>Course Title</th>
              <th style={{ width: 88, textAlign: 'center' }}>Type</th>
              <th style={{ width: 68, textAlign: 'center' }}>Credits</th>
              <th style={{ width: 80, textAlign: 'center' }}>Grade</th>
              <th style={{ width: 90, textAlign: 'center' }}>Points</th>
              <th style={{ width: 60, textAlign: 'center' }}>Load</th>
              <th style={{ width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 && (
              <tr>
                <td colSpan={9}>
                  <div className="empty-state">No courses yet — click "+ Add Course" to get started</div>
                </td>
              </tr>
            )}
            {courses.map((c, i) => {
              const gp   = gradePoints(c.grade);
              const load = gp !== null ? gp * c.credits : '–';
              return (
                <tr key={c.id}>
                  <td className="td-pad" style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
                    {i + 1}
                  </td>
                  <td>
                    <EditableCell value={c.code} onChange={v => onUpdate(c.id, 'code', v)} mono />
                  </td>
                  <td>
                    <EditableCell value={c.title} onChange={v => onUpdate(c.id, 'title', v)} />
                  </td>
                  <td className="td-pad" style={{ textAlign: 'center' }}>
                    <select
                      className="type-select"
                      value={c.type || 'Core'}
                      onChange={e => onUpdate(c.id, 'type', e.target.value)}
                    >
                      {COURSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <EditableCell
                      value={c.credits}
                      onChange={v => onUpdate(c.id, 'credits', Math.max(0, Math.min(10, Number(v))))}
                      type="number" align="center"
                    />
                  </td>
                  <td className="td-pad" style={{ textAlign: 'center' }}>
                    <select
                      className="grade-select"
                      value={c.grade}
                      onChange={e => onUpdate(c.id, 'grade', e.target.value)}
                    >
                      {GRADE_LABELS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </td>
                  <td className="td-pad" style={{ textAlign: 'center' }}>
                    <GradeBadge grade={c.grade} />
                  </td>
                  <td className="td-pad" style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-1)', fontSize: 13 }}>
                    {load}
                  </td>
                  <td className="td-pad" style={{ textAlign: 'center' }}>
                    <button className="btn-delete-row" onClick={() => onDelete(c.id)} title="Remove">×</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
