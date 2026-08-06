'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function login(prevState: { error?: string } | undefined, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password are required.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { error: 'Invalid username or password.' };
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return { error: 'Invalid username or password.' };
    }

    const session = await getSession();
    session.userId = user.id;
    session.username = user.username;
    await session.save();

  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An error occurred during login.' };
  }

  redirect('/');
}

export async function register(prevState: { error?: string } | undefined, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username and password are required.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { error: 'Username already exists.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password_hash: hashedPassword,
      },
    });

    const session = await getSession();
    session.userId = user.id;
    session.username = user.username;
    await session.save();

  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'An error occurred during registration.' };
  }

  redirect('/');
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect('/login');
}
