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

  // 1. Trigger the Real Production Deployment
  const { triggerCloudflareDeployment } = await import('@/lib/deployments');
  const deployResult = await triggerCloudflareDeployment(project.id, repo);

  if (deployResult.success) {
    await prisma.deployment.create({
      data: {
        projectId: project.id,
        status: 'SUCCESS',
        commitHash: 'INITIAL',
        deploymentUrl: deployResult.deploymentUrl,
        buildLogs: '> Build triggered via DeployHQ Engine\n> Cloning repository...\n> Running deployment...\n> Success!'
      }
    });
  }

  // 2. Automated Cloudflare for SaaS Registration (Domain side)
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

  // 1. Create the Database Record
  const project = await prisma.project.create({
    data: {
      userId,
      name,
      repository: `Local: ${folderName}`,
      buildCommand: 'n/a (pre-built)',
      outputDir: './',
    }
  });

  // 2. Real Production Asset Sync (R2)
  const { uploadToR2 } = await import('@/lib/storage');
  console.log(`[DeployHQ] Syncing ${files.length} assets to production storage for ${name}...`);

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    if (file.name.endsWith('.html')) contentType = 'text/html';
    else if (file.name.endsWith('.css')) contentType = 'text/css';
    else if (file.name.endsWith('.js')) contentType = 'application/javascript';
    else if (file.name.endsWith('.json')) contentType = 'application/json';
    else if (file.name.endsWith('.png')) contentType = 'image/png';
    else if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (file.name.endsWith('.svg')) contentType = 'image/svg+xml';

    // Store in R2 under the project name prefix
    await uploadToR2(`${name}/${file.name}`, buffer, contentType);
  }

  // 3. Register as a Production Successful Deployment
  await prisma.deployment.create({
    data: {
      projectId: project.id,
      status: 'SUCCESS',
      commitHash: 'UPLOAD_V1',
      deploymentUrl: `http://${name}.localhost:4400`, // Internal Virtual URL (Middleware handles resolution)
      buildLogs: `> [Engine] Successfully processed ${files.length} assets.\n> [Engine] Deploying to Cloudflare R2 storage...\n> [Engine] Site is live!`
    }
  });

  // 4. Automated Cloudflare for SaaS Registration
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

export async function deleteProject(projectId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth')?.value;
  if (!userId) throw new Error("Unauthorized");

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project || project.userId !== userId) {
    throw new Error("Project not found or unauthorized");
  }

  // 1. Delete associated data
  await prisma.deployment.deleteMany({ where: { projectId } });
  await prisma.domain.deleteMany({ where: { projectId } });
  await prisma.envVar.deleteMany({ where: { projectId } });

  // 2. Delete the project
  await prisma.project.delete({ where: { id: projectId } });

  // 3. Redirect back to dashboard
  redirect('/dashboard');
}


