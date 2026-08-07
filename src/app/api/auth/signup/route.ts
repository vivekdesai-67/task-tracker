import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username: username.trim().toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username: username.trim().toLowerCase(),
        password: hashed,
        role: 'user',
      },
    });

    const res = NextResponse.json({ ok: true });
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    session.userId = user.id;
    session.username = user.username;
    session.role = user.role;
    await session.save();

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
