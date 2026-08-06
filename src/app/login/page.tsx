'use client';

import { useActionState, useState } from 'react';
import { login, register } from '@/app/actions/auth';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginState, loginAction, isLoginPending] = useActionState(login, undefined);
  const [registerState, registerAction, isRegisterPending] = useActionState(register, undefined);

  const state = isLogin ? loginState : registerState;
  const isPending = isLogin ? isLoginPending : isRegisterPending;
  const action = isLogin ? loginAction : registerAction;

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
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            marginBottom: '3rem',
          }}
        >
          <div style={{
            width: '12px', height: '12px',
            background: '#f59e0b',
            borderRadius: '50%',
            boxShadow: '0 0 15px rgba(245,158,11,0.5)',
          }} />
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 500,
            color: 'white',
            letterSpacing: '0.15em',
            margin: 0,
            textTransform: 'uppercase',
          }}>
            Ledger
          </h1>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '2.5rem 2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: isLogin ? 'white' : 'rgba(255,255,255,0.4)',
                fontSize: '0.9rem', fontWeight: isLogin ? 500 : 400,
                borderBottom: isLogin ? '2px solid #f59e0b' : '2px solid transparent',
                paddingBottom: '0.5rem', transition: 'all 0.2s',
              }}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: !isLogin ? 'white' : 'rgba(255,255,255,0.4)',
                fontSize: '0.9rem', fontWeight: !isLogin ? 500 : 400,
                borderBottom: !isLogin ? '2px solid #f59e0b' : '2px solid transparent',
                paddingBottom: '0.5rem', transition: 'all 0.2s',
              }}
            >
              Sign Up
            </button>
          </div>

          <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label htmlFor="username" style={{
                display: 'block', fontSize: '0.75rem', fontWeight: 500,
                color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em',
                textTransform: 'uppercase', marginBottom: '0.5rem',
              }}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoFocus
                autoComplete="username"
                placeholder="johndoe"
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.25)',
                  border: `1px solid ${state?.error && state.error.includes('Username') ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '8px',
                  color: 'white',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '1rem',
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
                  e.target.style.borderColor = (state?.error && state.error.includes('Username')) ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label htmlFor="password" style={{
                display: 'block', fontSize: '0.75rem', fontWeight: 500,
                color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em',
                textTransform: 'uppercase', marginBottom: '0.5rem',
              }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.25)',
                  border: `1px solid ${state?.error && !state.error.includes('Username') ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.1)'}`,
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
                  e.target.style.borderColor = (state?.error && !state.error.includes('Username')) ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.1)';
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
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: isPending ? 'wait' : 'pointer',
                marginTop: '0.5rem',
                transition: 'background 0.2s',
              }}
            >
              {isPending ? 'Authenticating...' : (isLogin ? 'Enter Ledger' : 'Create Account')}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
