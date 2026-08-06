"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

const slides = [
  {
    id: 1,
    title: "Welcome to Ledger",
    content: "Your personal, single-user daily task tracker with a clean, distraction-free aesthetic.",
    icon: "✦"
  },
  {
    id: 2,
    title: "Adding & Prioritizing",
    content: "Quickly add tasks, assign priorities (Low, Med, Important), and add custom tags like #work.",
    icon: "📝"
  },
  {
    id: 3,
    title: "Smart Alerts",
    content: "Ledger will automatically notify you exactly 1 hour before a task is due, and again when it's immediately due.",
    icon: "🔔"
  },
  {
    id: 4,
    title: "Recycle Bin",
    content: "Accidentally deleted a task? No problem. Open the Recycle Bin from the navigation menu to restore it anytime.",
    icon: "🗑️"
  }
];

export default function WelcomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(s => s + 1);
    } else {
      localStorage.setItem('ledger_hasSeenWelcome', 'true');
      router.push('/');
    }
  };

  return (
    <>
      <Head>
        <title>Welcome — Ledger</title>
      </Head>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #07090e 0%, #111726 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        fontFamily: 'var(--font-sans)',
        color: 'white'
      }}>
        <div style={{ width: '100%', maxWidth: '600px', position: 'relative', height: '400px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                borderRadius: '24px',
                padding: '3rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{slides[currentSlide].icon}</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-text-inverse)', marginBottom: '1rem' }}>
                {slides[currentSlide].title}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                {slides[currentSlide].content}
              </p>
            </motion.div>
          </AnimatePresence>
          
          <div style={{
            position: 'absolute',
            bottom: '-5rem',
            left: 0, right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {slides.map((_, idx) => (
                <div 
                  key={idx}
                  style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: idx === currentSlide ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)',
                    transition: 'background 0.3s ease'
                  }}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--color-primary)',
                color: 'var(--color-bg)',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              {currentSlide < slides.length - 1 ? (
                <>Next <ChevronRight size={18} /></>
              ) : (
                <>Get Started <Check size={18} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
