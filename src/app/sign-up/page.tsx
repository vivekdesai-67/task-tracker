"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export default function SignUpPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return; }
      router.push('/');
    } catch { setError('Network error'); setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #07090e 0%, #111726 100%)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '2rem', fontFamily: 'var(--font-sans)', color: 'white'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-accent-teal, #14b8a6)' }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'white' }}>Ledger</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Create your account</p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.4rem' }}>Username</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                required autoFocus placeholder="Choose a username"
                style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.4rem' }}>Password <span style={{ color: 'rgba(255,255,255,0.3)' }}>(min. 6 chars)</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  required placeholder="Choose a password"
                  style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '6px', padding: '0.6rem 0.75rem', color: '#f43f5e', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <motion.button
              type="submit" disabled={loading}
              whileTap={{ scale: 0.97 }}
              style={{ marginTop: '0.5rem', padding: '0.85rem', background: 'var(--color-accent-teal, #14b8a6)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'var(--font-sans)' }}
            >
              <UserPlus size={16} /> {loading ? 'Creating account…' : 'Create Account'}
            </motion.button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          Already have an account?{' '}
          <a href="/sign-in" style={{ color: 'var(--color-accent-teal, #14b8a6)', textDecoration: 'none', fontWeight: 600 }}>Sign in</a>
        </p>
      </motion.div>
    </div>
  );
}
