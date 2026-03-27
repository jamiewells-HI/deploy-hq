'use server';

import prisma from '@/lib/prisma';

export async function getLatestDeployment(projectId: string) {
  try {
    const deployment = await prisma.deployment.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' }
    });
    
    return deployment;
  } catch (e) {
    return null;
  }
}
