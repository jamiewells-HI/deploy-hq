import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const host = (await headers()).get('host');
  const userId = cookieStore.get('auth')?.value;

  if (!userId) {
    redirect('/login');
  }

  // Fetch all projects alongside their latest deployment status
  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      deployments: {
        orderBy: { createdAt: 'desc' },
        take: 1, // Only grab the most recent deployment
      }
    }
  });

  return (
    <div className="min-h-screen bg-black text-zinc-200 p-8 sm:p-12 md:p-20 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white m-0">Projects</h1>
          <Link 
            href="/new" 
            className="flex items-center gap-2 bg-zinc-100 text-zinc-950 font-semibold px-4 py-2 rounded-md hover:bg-white transition duration-200 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center bg-[#09090b] flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">No projects yet</h2>
            <p className="text-zinc-500 mb-6 max-w-sm">Connect your GitHub repository to deploy your first application incredibly fast.</p>
            <Link 
              href="/new" 
              className="bg-black border border-zinc-800 text-zinc-300 font-medium px-5 py-2.5 rounded-md hover:border-zinc-600 hover:text-white transition-all shadow-sm"
            >
              Import Repository
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const latestDeployment = project.deployments[0];
              const isBuilding = latestDeployment?.status === 'BUILDING' || latestDeployment?.status === 'QUEUED';
              const isSuccess = latestDeployment?.status === 'SUCCESS';
              const isError = latestDeployment?.status === 'FAILED';

              // Fallback generated URL for UI mockup purposes
              const displayUrl = `${project.name.toLowerCase().replace(/\s+/g, '-')}.${host}`;

              return (
                <Link key={project.id} href={`/dashboard/${project.id}`}>
                  <div className="flex flex-col border border-zinc-800 bg-[#09090b] rounded-xl overflow-hidden hover:border-zinc-700 transition duration-200 h-full group">
                    <div className="p-6 pb-4 flex justify-between items-start">
                      <div>
                        {/* Status Bubble injected into Header directly */}
                        <h2 className="text-zinc-100 font-semibold text-lg flex items-center gap-2">
                          {project.name}
                          {isSuccess && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                          {isBuilding && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />}
                          {isError && <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                        </h2>
                        <span className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">
                          {displayUrl}
                        </span>
                      </div>
                    </div>
                    
                    <div className="px-6 flex items-center gap-2 text-sm text-zinc-300 font-medium pb-5">
                      <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18c-4.51 2-5-2-7-2m14 0v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      </svg>
                      {project.repository ? project.repository.replace('https://github.com/', '') : 'Manual Upload'}
                    </div>

                    <div className="px-6 py-4 flex items-center justify-between border-t border-zinc-800/50 bg-[#09090b] mt-auto">
                      <div className="flex gap-4 text-xs text-zinc-500 font-medium">
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800">
                          <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path>
                          </svg>
                          main
                        </span>
                        {latestDeployment && (
                          <span className="flex items-center gap-2">
                            {latestDeployment.commitHash ? latestDeployment.commitHash.substring(0, 7) : 'Manual Deploy'}
                            {' • '}
                            {Math.round((Date.now() - new Date(latestDeployment.createdAt).getTime()) / 60000) === 0 ? 'Just now' : `${Math.round((Date.now() - new Date(latestDeployment.createdAt).getTime()) / 60000)}m ago`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
