import { redirect } from 'next/navigation';

export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  
  if (!clientId || clientId === 'your-github-client-id') {
    return new Response('GitHub Client ID not configured', { status: 500 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:email,repo`;

  redirect(githubAuthUrl);
}
