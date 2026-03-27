import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function ProjectSite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Since slug can be a subdomain (test-a1b2c3) or a custom domain (user.com)
  // We need to find the project by slug (name) OR by its custom domains!
  const project = await prisma.project.findFirst({
    where: {
      OR: [
        { name: slug },
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
    console.error(`[Project Serving] No project found for slug: ${slug}`);
    return notFound();
  }

  const latestDeployment = project.deployments[0];

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-8 font-sans">
      <div className="max-w-md w-full border border-zinc-800 rounded-2xl p-10 bg-black shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center">
        
        <div className="w-16 h-16 bg-white border border-zinc-800 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-[0_0_20px_rgba(255,255,255,0.1)]">
           <svg className="w-8 h-8 text-black" viewBox="0 0 128 128"><path fill="currentColor" d="M64 0A64 64 0 1 1 0 64 64 64 0 0 1 64 0Zm20.45 93.36-31.5-44L52 48.24h-9.8v31.52h8V54.43l27.14 38.69h-5.23l25.54 36.32a63.55 63.55 0 0 0 16-11.83Zm11-45.12V48.24H83.82L96 66Zm0 0V48.24H83.82L96 66Z"/></svg>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">{project.name}</h1>
        <p className="text-zinc-500 text-sm mb-8">This project is successfully hosted via DeployHQ engine.</p>
        
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-8">
          <p className="text-xs text-zinc-500 uppercase font-mono tracking-widest mb-1.5 font-bold text-center">Active Deployment</p>
          <p className="text-sm font-semibold text-emerald-400 font-mono text-center">Ready • {latestDeployment ? latestDeployment.id.substring(0, 8) : 'Pending'}</p>
        </div>

        {latestDeployment?.id ? (
          <div className="space-y-4">
             <div className="p-10 border border-emerald-500/20 bg-emerald-500/5 rounded-xl text-emerald-500 font-medium animate-pulse">
                Project Content Hook Connected.
             </div>
             <p className="text-xs text-zinc-600">The core engine is now securely proxying traffic for {slug}.</p>
          </div>
        ) : (
          <div className="p-8 border border-amber-500/20 bg-amber-500/5 rounded-xl text-amber-500 font-medium">
             Building in progress...
          </div>
        )}
      </div>
    </div>
  );
}
