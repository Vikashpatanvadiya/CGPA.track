// In production, VITE_API_URL points to the Render backend
// In dev, Vite proxy handles /api → localhost:3001
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

function getToken() { return localStorage.getItem('cgpa_token') || ''; }

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

/* ── Auth ── */
export async function signup(name, email, password) {
  const res  = await fetch(`${BASE}/auth/signup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  return data;
}

export async function login(email, password) {
  const res  = await fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

/* ── Semesters (auth required) ── */
export async function fetchSemesters() {
  const res = await fetch(`${BASE}/semesters`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load semesters');
  return res.json();
}

export async function saveSemesters(semesters) {
  const res = await fetch(`${BASE}/semesters`, {
    method: 'POST', headers: authHeaders(),
    body: JSON.stringify({ semesters }),
  });
  if (!res.ok) throw new Error('Failed to save');
  return res.json();
}

/* ── Share (public, no auth) ── */
export async function fetchSharedSemesters(token) {
  const res = await fetch(`${BASE}/semesters/share/${token}`);
  if (!res.ok) throw new Error('Share link not found or expired');
  return res.json();
}

/* ── Predictor rows (auth required) ── */
export async function fetchPredictor() {
  const res = await fetch(`${BASE}/predictor`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load predictor');
  return res.json();
}

export async function savePredictor(rows) {
  const res = await fetch(`${BASE}/predictor`, {
    method: 'POST', headers: authHeaders(),
    body: JSON.stringify({ rows }),
  });
  if (!res.ok) throw new Error('Failed to save predictor');
  return res.json();
}
