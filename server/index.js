import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import authRouter      from './routes/auth.js';
import semestersRouter from './routes/semesters.js';

const app  = express();
const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL?.replace(/\/$/, ''), // strip trailing slash
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (curl, mobile apps)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.options('*', cors()); // handle preflight for all routes
app.use(express.json());

app.use('/api/auth',      authRouter);
app.use('/api/semesters', semestersRouter);
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

initDB()
  .then(() => app.listen(PORT, () => console.log(`🚀 API running at http://localhost:${PORT}`)))
  .catch(err => { console.error('Failed to init DB:', err.message); process.exit(1); });
