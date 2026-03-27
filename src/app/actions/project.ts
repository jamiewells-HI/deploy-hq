'use server';

import prisma from '@/lib/prisma';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { registerCustomHostname } from '@/lib/cloudflare';

export async function createTemplateProject(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth')?.value;

  if (!userId) redirect('/login');

  let nameInput = formData.get('name') as string || 'deployhq-demo';
  nameInput = nameInput.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const name = `${nameInput}-${Math.random().toString(36).substring(2, 8)}`;
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

  // Automated Cloudflare for SaaS Registration
  const host = (await headers()).get('host');
  if (host && !host.includes('localhost')) {
    const customHostname = `${name.toLowerCase().replace(/\s+/g, '-')}.${host}`;
    console.log(`[DeployHQ] Registering custom hostname with Cloudflare: ${customHostname}`);
    await registerCustomHostname(customHostname);
  }

  redirect(`/dashboard/${project.id}`);
}

export async function uploadLocalProject(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth')?.value;

  if (!userId) redirect('/login');

  const files = formData.getAll('files') as File[];
  const folderName = formData.get('folderName') as string || 'Local Project';
  let nameInput = formData.get('name') as string || 'local-app';
  nameInput = nameInput.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const name = `${nameInput}-${Math.random().toString(36).substring(2, 8)}`;
  
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

  // Automated Cloudflare for SaaS Registration
  const host = (await headers()).get('host');
  if (host && !host.includes('localhost')) {
    const customHostname = `${name.toLowerCase().replace(/\s+/g, '-')}.${host}`;
    console.log(`[DeployHQ] Registering custom hostname with Cloudflare: ${customHostname}`);
    await registerCustomHostname(customHostname);
  }

  redirect(`/dashboard/${project.id}`);
}

export async function addCustomDomain(projectId: string, hostname: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth')?.value;
  if (!userId) throw new Error("Unauthorized");

  // Basic validation
  if (!hostname.includes('.') || hostname.length < 4) {
    throw new Error("Invalid domain name");
  }

  const domain = await prisma.domain.create({
    data: {
      projectId,
      hostname: hostname.toLowerCase(),
      status: 'PENDING'
    }
  });

  // Register with Cloudflare SaaS
  const cfResponse = await registerCustomHostname(hostname);
  
  if (!cfResponse.success) {
    console.error("Cloudflare registration failed, keeping PENDING for manual retry", cfResponse.errors);
  }

  return domain;
}

export async function deleteCustomDomain(domainId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth')?.value;
  if (!userId) throw new Error("Unauthorized");

  await prisma.domain.delete({
    where: { id: domainId }
  });
}

export async function upsertEnvVars(projectId: string, vars: { key: string, value: string }[]) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth')?.value;
  if (!userId) throw new Error("Unauthorized");

  // Clean and filter empty keys
  const cleanVars = vars.filter(v => v.key.trim() !== '');

  for (const v of cleanVars) {
    await prisma.envVar.upsert({
      where: {
        projectId_key: {
          projectId,
          key: v.key.trim()
        }
      },
      update: { value: v.value },
      create: {
        projectId,
        key: v.key.trim(),
        value: v.value
      }
    });
  }
}

export async function deleteEnvVar(id: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth')?.value;
  if (!userId) throw new Error("Unauthorized");

  await prisma.envVar.delete({
    where: { id }
  });
}


