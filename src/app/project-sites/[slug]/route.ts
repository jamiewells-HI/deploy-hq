import { NextResponse } from 'next/server';
import { getFromR2 } from '@/lib/storage';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Identify the project name (slug might be a custom domain)
  const project = await prisma.project.findFirst({
    where: {
      OR: [
        { name: slug },
        { domains: { some: { hostname: slug } } }
      ]
    }
  });

  if (!project) return new Response('Project Not Found', { status: 404 });

  // 2. Fetch the index file from R2
  // We try index.html by default for the root
  const folderPrefix = project.name;
  const fileBody = await getFromR2(`${folderPrefix}/index.html`);

  if (!fileBody) {
    return new Response(`Welcome to ${project.name}! (No index.html found in R2)`, {
        headers: { 'Content-Type': 'text/html' }
    });
  }

  // 3. Stream the result back to the browser
  return new Response(fileBody as any, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
