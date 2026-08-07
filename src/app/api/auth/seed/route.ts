import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Called once on first deploy to seed the default admin account
export async function GET() {
  try {
    const existing = await prisma.user.findUnique({ where: { username: 'admin' } });
    if (existing) {
      return NextResponse.json({ message: 'Admin already exists' });
    }
    const hashed = await bcrypt.hash('admin@123', 12);
    await prisma.user.create({
      data: { username: 'admin', password: hashed, role: 'admin' },
    });
    return NextResponse.json({ message: 'Admin seeded — username: admin, password: admin@123' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
