import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { computeSGPA, gradeDistribution } from '../utils/gradeUtils';

const BLACK = '#191919';
const GREY  = '#d4d4d4';

const tip = {
  contentStyle: {
    borderRadius: 6, border: '1px solid #e9e9e7',
    fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    color: '#191919',
  },
};

/* ── SGPA Trend ── */
export function SGPATrendChart({ semesters }) {
  const data = semesters.map(sem => ({
    name: sem.name.replace(/Sem \d+ – /, ''),
    sgpa: computeSGPA(sem).sgpa,
  }));

  const Dot = ({ cx, cy, value }) => (
    <g>
      <circle cx={cx} cy={cy} r={4} fill={BLACK} stroke="#fff" strokeWidth={2} />
      <text x={cx} y={cy - 10} textAnchor="middle" fill={BLACK} fontSize={10} fontWeight={700}>{value}</text>
    </g>
  );

  return (
    <div className="card">
      <div className="card-header"><span className="card-title">SGPA Trend</span></div>
      <div className="card-body" style={{ paddingTop: 8 }}>
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={data} margin={{ top: 18, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f1ef" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
            <Tooltip {...tip} formatter={v => [v.toFixed(2), 'SGPA']} />
            <ReferenceLine y={7} stroke="#e9e9e7" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="sgpa" stroke={BLACK} strokeWidth={2}
              dot={<Dot />} activeDot={{ r: 5, fill: BLACK }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Credits Bar ── */
export function CreditsBarChart({ semesters }) {
  const data = semesters.map(sem => {
    const s = computeSGPA(sem);
    return { name: sem.name.replace(/Sem \d+ – /, ''), Registered: s.registered, Earned: s.earned };
  });

  return (
    <div className="card">
      <div className="card-header"><span className="card-title">Credits per Semester</span></div>
      <div className="card-body" style={{ paddingTop: 8 }}>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f1ef" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#999' }} axisLine={false} tickLine={false} />
            <Tooltip {...tip} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Bar dataKey="Registered" fill={GREY}  radius={[3, 3, 0, 0]} maxBarSize={26} />
            <Bar dataKey="Earned"     fill={BLACK}  radius={[3, 3, 0, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Grade Distribution ── */
export function GradeDistPie({ semester }) {
  const dist = gradeDistribution(semester);
  if (dist.length === 0) return null;

  // Greyscale palette for pie slices
  const GREYS = ['#191919','#404040','#606060','#808080','#a0a0a0','#c0c0c0','#d8d8d8','#ebebeb'];

  const data = dist.map(d => ({ name: d.grade, value: d.count }));

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name }) => {
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
        {name}
      </text>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Grade Distribution</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{semester.name}</span>
      </div>
      <div className="card-body" style={{ paddingTop: 8 }}>
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={76} dataKey="value"
              labelLine={false} label={renderLabel}>
              {data.map((_, i) => <Cell key={i} fill={GREYS[i % GREYS.length]} />)}
            </Pie>
            <Tooltip {...tip} formatter={(v, n) => [`${v} course${v > 1 ? 's' : ''}`, n]} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── CGPA Progress ── */
export function CGPAProgressBar({ cgpa }) {
  const pct = Math.min((cgpa / 10) * 100, 100);
  const milestones = [
    { val: 5, label: 'Pass' },
    { val: 6.5, label: 'Good' },
    { val: 8, label: 'Very Good' },
    { val: 9, label: 'Excellent' },
  ];

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">CGPA Progress</span>
        <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-1)' }}>
          {cgpa.toFixed(2)}
          <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-3)' }}> / 10</span>
        </span>
      </div>
      <div className="card-body">
        <div className="progress-track" style={{ marginBottom: 10 }}>
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {milestones.map(m => (
            <div key={m.val} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>{m.val}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
