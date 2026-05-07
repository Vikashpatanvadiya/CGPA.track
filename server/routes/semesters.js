import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/* ── helper: build semester array from DB rows ── */
function buildSemesters(semRows, courseRows) {
  return semRows.map(sem => ({
    id:            Number(sem.client_id),
    name:          sem.name,
    period:        sem.period,
    courses:       courseRows
                     .filter(c => Number(c.semester_client_id) === Number(sem.client_id) && !c.is_repeat)
                     .map(shapeCourse),
    repeatCourses: courseRows
                     .filter(c => Number(c.semester_client_id) === Number(sem.client_id) && c.is_repeat)
                     .map(shapeCourse),
  }));
}

function shapeCourse(c) {
  return { id: c.client_id, code: c.code, title: c.title, credits: c.credits, grade: c.grade, type: c.type };
}

/* ── GET /api/semesters  (auth required) ── */
router.get('/', requireAuth, async (req, res) => {
  try {
    const sems    = await sql`SELECT * FROM semesters WHERE user_id = ${req.user.id} ORDER BY client_id ASC`;
    const courses = await sql`SELECT * FROM courses   WHERE user_id = ${req.user.id} ORDER BY created_at ASC`;
    res.json(buildSemesters(sems, courses));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/semesters  (auth required) ── */
router.post('/', requireAuth, async (req, res) => {
  const { semesters } = req.body;
  if (!Array.isArray(semesters)) return res.status(400).json({ error: 'semesters must be an array' });

  const uid = req.user.id;
  try {
    for (const sem of semesters) {
      await sql`
        INSERT INTO semesters (client_id, user_id, name, period)
        VALUES (${sem.id}, ${uid}, ${sem.name}, ${sem.period || ''})
        ON CONFLICT (client_id, user_id) DO UPDATE
          SET name = EXCLUDED.name, period = EXCLUDED.period
      `;
      for (const c of [...(sem.courses || []), ...(sem.repeatCourses || [])]) {
        const isRepeat = (sem.repeatCourses || []).some(r => r.id === c.id);
        await sql`
          INSERT INTO courses (client_id, user_id, semester_client_id, code, title, credits, grade, type, is_repeat)
          VALUES (${c.id}, ${uid}, ${sem.id}, ${c.code}, ${c.title}, ${c.credits}, ${c.grade}, ${c.type || 'Core'}, ${isRepeat})
          ON CONFLICT (client_id, user_id) DO UPDATE
            SET code = EXCLUDED.code, title = EXCLUDED.title, credits = EXCLUDED.credits,
                grade = EXCLUDED.grade, type = EXCLUDED.type,
                semester_client_id = EXCLUDED.semester_client_id, is_repeat = EXCLUDED.is_repeat
        `;
      }
    }
    // Remove deleted semesters
    const keepIds = semesters.map(s => s.id);
    if (keepIds.length > 0) {
      await sql`DELETE FROM semesters WHERE user_id = ${uid} AND client_id != ALL(${keepIds})`;
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /semesters error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ── GET /api/semesters/share/:token  (public, read-only) ── */
router.get('/share/:token', async (req, res) => {
  try {
    const [user] = await sql`SELECT id, name, email FROM users WHERE share_token = ${req.params.token}`;
    if (!user) return res.status(404).json({ error: 'Share link not found' });

    const sems    = await sql`SELECT * FROM semesters WHERE user_id = ${user.id} ORDER BY client_id ASC`;
    const courses = await sql`SELECT * FROM courses   WHERE user_id = ${user.id} ORDER BY created_at ASC`;

    res.json({
      owner:     { name: user.name, email: user.email },
      semesters: buildSemesters(sems, courses),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
