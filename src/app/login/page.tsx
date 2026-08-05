'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, undefined);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #07090e 0%, #111726 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Noise overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.028,
      }} />

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: '380px',
          padding: '0 1.5rem',
        }}
      >
        {/* Brand mark */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '2.5rem' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            fontFamily: "'Fraunces', serif",
            fontSize: '2rem', fontWeight: 600,
            color: '#f1f5f9', letterSpacing: '-0.03em',
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: '#f59e0b',
              boxShadow: '0 0 14px rgba(245,158,11,0.7)',
            }} />
            Ledger
          </div>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginTop: '0.5rem',
          }}>
            Personal Task Tracker
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            padding: '2rem',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: '1.4rem', fontWeight: 500,
            color: '#f1f5f9', marginBottom: '0.4rem',
            letterSpacing: '-0.02em',
          }}>
            Welcome back
          </h1>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '1.75rem',
          }}>
            Enter your password to open your ledger.
          </p>

          <form action={formAction}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoFocus
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.25)',
                  border: `1px solid ${state?.error ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '8px',
                  color: 'white',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '1rem',
                  letterSpacing: '0.15em',
                  padding: '0.75rem 1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(245,158,11,0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = state?.error ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />

              {/* Error message */}
              {state?.error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '0.7rem',
                    color: '#f43f5e',
                    marginTop: '0.5rem',
                  }}
                >
                  {state.error}
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isPending}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%',
                background: isPending ? 'rgba(245,158,11,0.5)' : '#f59e0b',
                color: '#07090e',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem',
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: isPending ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, box-shadow 0.2s',
                boxShadow: isPending ? 'none' : '0 4px 16px rgba(245,158,11,0.3)',
              }}
            >
              {isPending ? 'Unlocking…' : 'Unlock Ledger →'}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer hint */}
        <p style={{
          textAlign: 'center',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.62rem',
          color: 'rgba(255,255,255,0.12)',
          marginTop: '1.5rem',
          letterSpacing: '0.06em',
        }}>
          Password set in .env → APP_PASSWORD
        </p>
      </motion.div>
    </div>
  );
}
