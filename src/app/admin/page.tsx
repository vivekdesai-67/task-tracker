"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LogOut, Users, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface User { id: string; username: string; role: string; created_at: string; tasks: Task[]; }
interface Task { id: string; title: string; done: boolean; deleted_at: string | null; due_date: string; priority: string; is_meeting: boolean; }

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { fetch('/api/admin/users').then(r => r.json()).then(d => { setUsers(d); setLoading(false); }); }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/sign-in');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#07090e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-sans)' }}>
      Loading…
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #07090e 0%, #0d1220 100%)', fontFamily: 'var(--font-sans)', color: 'white' }}>
      {/* Topbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, background: 'rgba(7,9,14,0.9)', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>Ledger</span>
          <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', background: 'rgba(244,63,94,0.15)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.05em' }}>ADMIN</span>
        </div>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.4rem 0.85rem', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.85rem' }}>
          <LogOut size={14} /> Sign Out
        </button>
      </nav>

      <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'white', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>{users.length} registered users · {users.reduce((s, u) => s + u.tasks.filter(t => !t.deleted_at).length, 0)} total active tasks</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {users.map(user => {
            const active = user.tasks.filter(t => !t.deleted_at);
            const done = active.filter(t => t.done).length;
            const pending = active.filter(t => !t.done).length;
            return (
              <motion.div key={user.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
                {/* User header */}
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: user.role === 'admin' ? 'rgba(244,63,94,0.15)' : 'rgba(230,164,82,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: user.role === 'admin' ? '#f43f5e' : 'var(--color-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                    {user.username[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'white' }}>{user.username}</span>
                      <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '3px', background: user.role === 'admin' ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.06)', color: user.role === 'admin' ? '#f43f5e' : 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase' }}>{user.role}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.1rem' }}>Joined {format(parseISO(user.created_at), 'MMM d, yyyy')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} /> {pending} pending</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#34d399' }}><CheckCircle2 size={12} /> {done} done</span>
                  </div>
                </div>
                {/* Task list */}
                <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '240px', overflowY: 'auto' }}>
                  {active.length === 0 && <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem', padding: '0.5rem 0' }}>No tasks yet</div>}
                  {active.map(t => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.done ? '#34d399' : t.priority === 'high' ? '#f43f5e' : 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '0.85rem', color: t.done ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.8)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.is_meeting && '📹 '}{t.title}</span>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{format(parseISO(t.due_date), 'MMM d')}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
