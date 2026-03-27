'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function createTemplateProject(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth')?.value;

  if (!userId) redirect('/login');

  const name = formData.get('name') as string || `deployhq-demo-${Math.random().toString(36).substring(2, 8)}`;
  const repo = formData.get('repo') as string || 'https://github.com/vercel/next.js';

  const project = await prisma.project.create({
    data: {
      userId,
      name,
      repository: repo,
      buildCommand: 'npm run build',
      outputDir: '.next',
    }
  });

  redirect(`/dashboard/${project.id}`);
}

export async function uploadLocalProject(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth')?.value;

  if (!userId) redirect('/login');

  const files = formData.getAll('files') as File[];
  const folderName = formData.get('folderName') as string || 'Local Project';
  const name = formData.get('name') as string || `local-app-${Math.random().toString(36).substring(2, 8)}`;
  
  if (!files || files.length === 0) {
    throw new Error("No files uploaded!");
  }

  // Calculate total payload size securely
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  console.log(`[DeployHQ] Securely receiving ${files.length} files (${Math.round(totalSize/1024)} KB) from directory: ${folderName}...`);

  const project = await prisma.project.create({
    data: {
      userId,
      name,
      repository: `Local Directory: ${folderName}`,
      buildCommand: 'npm run build',
      outputDir: 'dist',
    }
  });

  redirect(`/dashboard/${project.id}`);
}
