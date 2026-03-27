import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'No slug provided' }, { status: 400 });
  }

  // Look for project by name OR domain
  const project = await prisma.project.findFirst({
    where: {
      OR: [
        { name: { equals: slug, mode: 'insensitive' } },
        {
          domains: {
            some: { hostname: slug.toLowerCase() }
          }
        }
      ]
    },
    include: {
      deployments: {
        where: { status: 'SUCCESS' },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: project.id,
    name: project.name,
    deploymentUrl: project.deployments[0]?.deploymentUrl || null
  });
}
