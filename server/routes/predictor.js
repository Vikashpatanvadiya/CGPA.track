import { Router } from 'express';
import { sql } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/* ── GET /api/predictor (auth required) ── */
router.get('/', requireAuth, async (req, res) => {
  try {
    const [row] = await sql`SELECT rows_json FROM predictor_rows WHERE user_id = ${req.user.id}`;
    res.json(row ? row.rows_json : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── POST /api/predictor (auth required) ── */
router.post('/', requireAuth, async (req, res) => {
  const { rows } = req.body;
  if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows must be an array' });

  try {
    await sql`
      INSERT INTO predictor_rows (user_id, rows_json, updated_at)
      VALUES (${req.user.id}, ${JSON.stringify(rows)}, NOW())
      ON CONFLICT (user_id) DO UPDATE
        SET rows_json = EXCLUDED.rows_json, updated_at = NOW()
    `;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
