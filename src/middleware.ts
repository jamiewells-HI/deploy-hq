import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|project-sites|.well-known|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // 1. Filter out standard platform traffic
  // Check if the current host is the main dashboard or a static path
  const platformHost = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || 'localhost:4400';
  
  if (
    hostname === platformHost || 
    hostname === 'localhost:4400' ||
    url.pathname.startsWith('/project-sites') ||
    url.pathname.startsWith('/.well-known')
  ) {
    return NextResponse.next();
  }

  // 2. Identify the Project
  let slug = '';
  
  // Handle local development subdomains (e.g. project.lvh.me:4400 or project.localhost:4400)
  if (hostname.includes('localhost') || hostname.includes('lvh.me')) {
    const parts = hostname.split('.');
    if (parts.length > 1) {
      slug = parts[0];
    }
  } else if (hostname.endsWith(platformHost)) {
    // Production subdomains (e.g. project.deployhq.host)
    slug = hostname.replace(`.${platformHost}`, '');
  } else {
    // It's a custom domain! (e.g. user-domain.com)
    slug = hostname;
  }

  if (!slug) return NextResponse.next();

  // 3. Project Lookup & Production Routing
  // In production, we fetch the actual deployment URL for this slug.
  // We'll call a secure internal API route that has Prisma access.
  try {
    const lookupUrl = new URL(`/api/project/lookup?slug=${slug}`, req.url);
    const res = await fetch(lookupUrl);
    const projectData = await res.json();

    if (projectData && projectData.deploymentUrl) {
      console.log(`[Middleware] PRO PROXY: Rewriting ${hostname} to ${projectData.deploymentUrl}${url.pathname}`);
      
      // Rewrite to the real Cloudflare Pages URL (silent proxy)
      return NextResponse.rewrite(new URL(`${projectData.deploymentUrl}${url.pathname}${url.search}`, projectData.deploymentUrl));
    }
  } catch (e) {
    console.error("[Middleware] Routing lookup failed, falling back to dashboard", e);
  }

  // Fallback: If no deployment yet, show the mock dashboard route
  return NextResponse.rewrite(new URL(`/project-sites/${slug}${url.pathname}`, req.url));
}
