import { NextResponse } from 'next/server';
import { getFromR2 } from '@/lib/storage';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string, path: string[] }> }) {
  const { slug, path } = await params;
  const filePath = path.join('/');

  // 1. Identify project
  const project = await prisma.project.findFirst({
    where: {
      OR: [
        { name: slug },
        { domains: { some: { hostname: slug } } }
      ]
    }
  });

  if (!project) return new Response('Project Not Found', { status: 404 });

  // 2. Fetch the specific file from R2
  const key = `${project.name}/${filePath}`;
  const fileBody = await getFromR2(key);

  if (!fileBody) {
    return new Response('File Not Found', { status: 404 });
  }

  // 3. Determine content type
  let contentType = 'application/octet-stream';
  if (filePath.endsWith('.css')) contentType = 'text/css';
  else if (filePath.endsWith('.js')) contentType = 'application/javascript';
  else if (filePath.endsWith('.png')) contentType = 'image/png';
  else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
  else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';
  else if (filePath.endsWith('.json')) contentType = 'application/json';

  return new Response(fileBody as any, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
