import { SessionOptions } from 'iron-session';

export interface SessionData {
  userId?: string;
  username?: string;
  role?: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'ledger-super-secret-key-at-least-32-chars-long',
  cookieName: 'ledger_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};
