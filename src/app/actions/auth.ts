'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export async function login(prevState: { error?: string } | undefined, formData: FormData) {
  const password = formData.get('password') as string;

  if (!password) {
    return { error: 'Password is required.' };
  }

  if (password !== process.env.APP_PASSWORD) {
    return { error: 'Incorrect password. Try again.' };
  }

  const session = await getSession();
  session.isLoggedIn = true;
  await session.save();

  redirect('/');
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect('/login');
}
