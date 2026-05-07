import { useState } from 'react';
import CourseTable from './CourseTable';
import SGPACard from './SGPACard';
import { GradeDistPie } from './Charts';
import { uid } from '../utils/gradeUtils';
import { COURSE_TYPES } from '../data/initialData';

export default function SemesterView({ semester, onUpdate, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [typeFilter, setTypeFilter]   = useState('All');

  const updateCourse = (courseId, field, value, isRepeat = false) => {
    const key = isRepeat ? 'repeatCourses' : 'courses';
    onUpdate({ ...semester, [key]: semester[key].map(c => c.id === courseId ? { ...c, [field]: value } : c) });
  };

  const deleteCourse = (courseId, isRepeat = false) => {
    const key = isRepeat ? 'repeatCourses' : 'courses';
    onUpdate({ ...semester, [key]: semester[key].filter(c => c.id !== courseId) });
  };

  const addCourse = (isRepeat = false) => {
    const key = isRepeat ? 'repeatCourses' : 'courses';
    onUpdate({ ...semester, [key]: [...semester[key], { id: uid(), code: 'NEW000', title: 'New Course', credits: 3, grade: 'B', type: 'Core' }] });
  };

  const filteredCourses = typeFilter === 'All' ? semester.courses : semester.courses.filter(c => (c.type || 'Core') === typeFilter);
  const filteredRepeat  = typeFilter === 'All' ? semester.repeatCourses : semester.repeatCourses.filter(c => (c.type || 'Core') === typeFilter);

  const typeCounts = COURSE_TYPES.reduce((acc, t) => {
    acc[t] = semester.courses.filter(c => (c.type || 'Core') === t).length;
    return acc;
  }, {});

  const filters = ['All', ...COURSE_TYPES];

  return (
    <div>
      {/* Semester header */}
      <div className="sem-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <input
            className="sem-name-input"
            value={semester.name}
            onChange={e => onUpdate({ ...semester, name: e.target.value })}
          />
          <input
            className="sem-period-input"
            value={semester.period || ''}
            onChange={e => onUpdate({ ...semester, period: e.target.value })}
            placeholder="e.g. July – Dec 2026"
          />
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {!showConfirm ? (
            <button className="btn-danger" onClick={() => setShowConfirm(true)}>Delete</button>
          ) : (
            <>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Delete semester?</span>
              <button className="btn-confirm" onClick={() => { onDelete(semester.id); setShowConfirm(false); }}>Delete</button>
              <button className="btn-cancel"  onClick={() => setShowConfirm(false)}>Cancel</button>
            </>
          )}
        </div>
      </div>

      {/* Type filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map(f => {
          const active = typeFilter === f;
          const count  = f === 'All' ? semester.courses.length : (typeCounts[f] || 0);
          return (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              style={{
                padding: '4px 12px', borderRadius: 'var(--r-sm)',
                border: `1px solid ${active ? 'var(--text-1)' : 'var(--border)'}`,
                background: active ? 'var(--black)' : 'var(--white)',
                color: active ? '#fff' : 'var(--text-2)',
                fontSize: 12, fontWeight: active ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.12s',
                opacity: count === 0 && f !== 'All' ? 0.4 : 1,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {f}
              <span style={{
                fontSize: 10, fontWeight: 600,
                background: active ? 'rgba(255,255,255,0.2)' : 'var(--surface-3)',
                color: active ? '#fff' : 'var(--text-3)',
                borderRadius: 3, padding: '0 5px',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <CourseTable
        courses={filteredCourses}
        title="Regular Courses"
        onUpdate={(id, f, v) => updateCourse(id, f, v, false)}
        onDelete={id => deleteCourse(id, false)}
        onAdd={() => addCourse(false)}
      />

      {(filteredRepeat.length > 0 || typeFilter === 'All') && (
        <CourseTable
          courses={filteredRepeat}
          title="Repeat / Supplementary"
          isRepeat
          onUpdate={(id, f, v) => updateCourse(id, f, v, true)}
          onDelete={id => deleteCourse(id, true)}
          onAdd={() => addCourse(true)}
        />
      )}

      <div className="charts-grid">
        <SGPACard semester={semester} />
        <GradeDistPie semester={semester} />
      </div>
    </div>
  );
}
