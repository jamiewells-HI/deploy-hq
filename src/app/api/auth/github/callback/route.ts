import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.json({ error: tokenData.error_description }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = await userResponse.json();

    // 3. Find or create user in our database
    // We try to match by githubId first, then by email
    let user = await prisma.user.findUnique({
      where: { githubId: String(githubUser.id) },
    });

    if (!user) {
      // Try to find by email if they already have an account
      const email = githubUser.email || `${githubUser.login}@github.com`;
      
      user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Link GitHub to existing account
        user = await prisma.user.update({
          where: { id: user.id },
          data: { githubId: String(githubUser.id) },
        });
      } else {
        // Create new account
        user = await prisma.user.create({
          data: {
            githubId: String(githubUser.id),
            email: email,
            name: githubUser.name || githubUser.login,
          },
        });
      }
    }

    // 4. Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('auth', user.id, { 
      secure: true, 
      httpOnly: true, 
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  } catch (error) {
    console.error('GitHub Auth Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
