import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set in .env');

export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  // Users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id           SERIAL PRIMARY KEY,
      name         TEXT NOT NULL,
      email        TEXT UNIQUE NOT NULL,
      password     TEXT NOT NULL,
      share_token  TEXT UNIQUE,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Semesters — now owned by a user
  await sql`
    CREATE TABLE IF NOT EXISTS semesters (
      id          SERIAL PRIMARY KEY,
      client_id   BIGINT NOT NULL,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      period      TEXT DEFAULT '',
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(client_id, user_id)
    )
  `;

  // Courses — linked to semester client_id + user_id
  await sql`
    CREATE TABLE IF NOT EXISTS courses (
      id          SERIAL PRIMARY KEY,
      client_id   TEXT NOT NULL,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      semester_client_id BIGINT NOT NULL,
      code        TEXT NOT NULL,
      title       TEXT NOT NULL,
      credits     INTEGER NOT NULL DEFAULT 3,
      grade       TEXT NOT NULL DEFAULT 'B',
      type        TEXT NOT NULL DEFAULT 'Core',
      is_repeat   BOOLEAN NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(client_id, user_id)
    )
  `;

  console.log('✅ Database tables ready');
}
