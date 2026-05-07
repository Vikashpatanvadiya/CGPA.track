import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Dropping old tables...');

  await sql`DROP TABLE IF EXISTS courses CASCADE`;
  await sql`DROP TABLE IF EXISTS semesters CASCADE`;
  await sql`DROP TABLE IF EXISTS users CASCADE`;

  console.log('Creating users table...');
  await sql`
    CREATE TABLE users (
      id           SERIAL PRIMARY KEY,
      name         TEXT NOT NULL,
      email        TEXT UNIQUE NOT NULL,
      password     TEXT NOT NULL,
      share_token  TEXT UNIQUE,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log('Creating semesters table...');
  await sql`
    CREATE TABLE semesters (
      id          SERIAL PRIMARY KEY,
      client_id   BIGINT NOT NULL,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name        TEXT NOT NULL,
      period      TEXT DEFAULT '',
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(client_id, user_id)
    )
  `;

  console.log('Creating courses table...');
  await sql`
    CREATE TABLE courses (
      id                 SERIAL PRIMARY KEY,
      client_id          TEXT NOT NULL,
      user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      semester_client_id BIGINT NOT NULL,
      code               TEXT NOT NULL,
      title              TEXT NOT NULL,
      credits            INTEGER NOT NULL DEFAULT 3,
      grade              TEXT NOT NULL DEFAULT 'B',
      type               TEXT NOT NULL DEFAULT 'Core',
      is_repeat          BOOLEAN NOT NULL DEFAULT FALSE,
      created_at         TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(client_id, user_id)
    )
  `;

  console.log('✅ Migration complete — all tables created fresh');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
