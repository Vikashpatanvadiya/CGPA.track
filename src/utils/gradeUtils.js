import { GRADE_SCALE } from '../data/initialData';

/** Returns numeric grade points or null for non-GPA courses */
export function gradePoints(grade) {
  const val = GRADE_SCALE[grade];
  return val === undefined ? 0 : val; // null for 'P'
}

/** Compute SGPA for a single semester */
export function computeSGPA(semester) {
  // Repeat courses override originals by course code
  const effective = {};
  semester.courses.forEach(c => { effective[c.code] = c; });
  semester.repeatCourses.forEach(c => { effective[c.code] = c; });

  let pts = 0, creditsUsed = 0, earned = 0, registered = 0;

  Object.values(effective).forEach(c => {
    const gp = gradePoints(c.grade);
    registered += c.credits;
    if (gp === null) return; // non-GPA
    creditsUsed += c.credits;
    if (gp > 0) { pts += gp * c.credits; earned += c.credits; }
  });

  const sgpa = creditsUsed > 0 ? pts / creditsUsed : 0;
  return {
    sgpa: parseFloat(sgpa.toFixed(2)),
    pts,
    creditsUsed,
    earned,
    registered,
  };
}

/** Compute CGPA across all semesters */
export function computeCGPA(semesters) {
  let totalPts = 0, totalCredits = 0, totalEarned = 0, totalReg = 0;
  semesters.forEach(sem => {
    const s = computeSGPA(sem);
    totalPts    += s.pts;
    totalCredits += s.creditsUsed;
    totalEarned += s.earned;
    totalReg    += s.registered;
  });
  const cgpa = totalCredits > 0 ? totalPts / totalCredits : 0;
  return {
    cgpa: parseFloat(cgpa.toFixed(2)),
    totalPts,
    totalCredits,
    totalEarned,
    totalReg,
  };
}

/** Grade distribution for a semester */
export function gradeDistribution(semester) {
  const dist = {};
  [...semester.courses, ...semester.repeatCourses].forEach(c => {
    dist[c.grade] = (dist[c.grade] || 0) + 1;
  });
  return Object.entries(dist).map(([grade, count]) => ({ grade, count }));
}

/** SGPA trend data for chart */
export function sgpaTrend(semesters) {
  return semesters.map(sem => ({
    name: sem.name.split('–')[0].trim(),
    sgpa: computeSGPA(sem).sgpa,
    fullName: sem.name,
  }));
}

/** Performance label */
export function performanceLabel(gpa) {
  if (gpa >= 9.5) return { label: 'Outstanding', color: '#15803d' };
  if (gpa >= 8.5) return { label: 'Excellent',   color: '#0369a1' };
  if (gpa >= 7.5) return { label: 'Very Good',   color: '#1d4ed8' };
  if (gpa >= 6.5) return { label: 'Good',        color: '#7c3aed' };
  if (gpa >= 5.5) return { label: 'Average',     color: '#b45309' };
  return { label: 'Needs Improvement', color: '#b91c1c' };
}

/** Unique id generator */
let _uid = 100;
export const uid = () => `id_${_uid++}`;
