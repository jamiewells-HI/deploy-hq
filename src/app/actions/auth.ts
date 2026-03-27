'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return { error: 'Invalid email or password' };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return { error: 'Invalid email or password' };
    }

    // Passwords match! Set the cookie with their ID safely
    const cookieStore = await cookies();
    cookieStore.set('auth', user.id, { secure: true, httpOnly: true, path: '/' });

  } catch (error) {
    console.error("Login verification crash:", error);
    return { error: 'An internal error occurred communicating with the database.' };
  }

  // Redirect out of the try-catch to properly run Next's navigation
  redirect('/dashboard');
}

export async function register(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: 'User already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      }
    });

    const cookieStore = await cookies();
    cookieStore.set('auth', user.id, { secure: true, httpOnly: true, path: '/' });
  } catch(error) {
    return { error: 'Could not create account at this time.' };
  }
  
  redirect('/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth');
  redirect('/login');
}
