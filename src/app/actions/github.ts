'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function getGithubRepositories() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth')?.value;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubAccessToken: true }
  });

  if (!user || !user.githubAccessToken) return null;

  try {
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
      headers: {
        Authorization: `Bearer ${user.githubAccessToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) return null;

    const repos = await response.json();
    return repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      url: repo.html_url,
      description: repo.description,
      language: repo.language,
      private: repo.private,
      updated_at: repo.updated_at
    }));
  } catch (e) {
    console.error('Error fetching github repos:', e);
    return null;
  }
}
