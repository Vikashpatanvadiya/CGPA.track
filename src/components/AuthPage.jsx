import { useState } from 'react';
import { signup, login } from '../services/api';

export default function AuthPage({ onAuth }) {
  const [mode,     setMode]     = useState('login'); // 'login' | 'signup'
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = mode === 'signup'
        ? await signup(name, email, password)
        : await login(email, password);
      localStorage.setItem('cgpa_token', data.token);
      localStorage.setItem('cgpa_user',  JSON.stringify(data.user));
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 24px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#191919', letterSpacing: '-0.5px' }}>
            cgpa<span style={{ color: '#999' }}>.track</span>
          </div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 6 }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </div>
        </div>

        {/* Card */}
        <div style={{
          border: '1px solid #e9e9e7', borderRadius: 10,
          padding: '28px 28px', background: '#fff',
        }}>
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <Field label="Full Name" type="text" value={name}
                onChange={setName} placeholder="Vikash Patanvadiya" />
            )}
            <Field label="Email" type="email" value={email}
              onChange={setEmail} placeholder="you@example.com" />
            <Field label="Password" type="password" value={password}
              onChange={setPassword} placeholder="Min. 6 characters" />

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 6, padding: '8px 12px',
                fontSize: 12, color: '#dc2626', marginBottom: 14,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '10px',
                background: loading ? '#555' : '#191919',
                color: '#fff', border: 'none', borderRadius: 6,
                fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#999' }}>
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button onClick={() => { setMode('signup'); setError(''); }}
                style={linkBtn}>Sign up</button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(''); }}
                style={linkBtn}>Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 600,
        color: '#555', marginBottom: 5,
      }}>{label}</label>
      <input
        type={type} value={value} required
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '9px 12px',
          border: '1px solid #e9e9e7', borderRadius: 6,
          fontSize: 13, color: '#191919', outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = '#191919'}
        onBlur={e => e.target.style.borderColor = '#e9e9e7'}
      />
    </div>
  );
}

const linkBtn = {
  background: 'none', border: 'none', color: '#191919',
  fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0,
  textDecoration: 'underline',
};
