import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import DeployPipelineButton from '@/components/ui/DeployPipelineButton';
import BuildLogViewer from '@/components/ui/BuildLogViewer';

export default async function ProjectDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const host = (await headers()).get('host');
  const userId = cookieStore.get('auth')?.value;

  if (!userId) {
    redirect('/login');
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      deployments: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!project || project.userId !== userId) {
    return <div className="text-white p-20 text-center">Project not found or access denied.</div>;
  }

  const latestDeployment = project.deployments[0];
  const displayUrl = `${project.name.toLowerCase().replace(/\s+/g, '-')}.${host}`;

  return (
    <div className="min-h-screen bg-black text-zinc-200 p-8 sm:p-12 md:p-20 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation / Breadcrumbs */}
        <div className="flex items-center gap-4 text-sm font-medium text-zinc-500 mb-8">
          <Link href="/dashboard" className="hover:text-zinc-200 transition-colors">Personal</Link>
          <span>/</span>
          <span className="text-zinc-100">{project.name}</span>
        </div>

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white m-0 mb-2">{project.name}</h1>
            <a href={`https://${displayUrl}`} target="_blank" className="text-blue-500 hover:underline inline-flex items-center gap-1.5 font-medium">
              {displayUrl}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>

          <div className="flex gap-3">
            <Link href={`/dashboard/${project.id}/settings`} className="bg-[#09090b] border border-zinc-800 text-zinc-300 font-semibold px-4 py-2 rounded-md hover:bg-zinc-900 transition-colors">
              Settings
            </Link>
            <DeployPipelineButton projectId={project.id} />
          </div>
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Deployment Pipeline Status */}
            <BuildLogViewer projectId={project.id} initialDeployments={project.deployments} />

            {/* Framework Block */}
            <div className="border border-zinc-800 rounded-xl bg-[#09090b] p-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">Framework</h2>
              <div className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black border border-zinc-800 flex items-center justify-center p-1.5">
                    <svg viewBox="0 0 128 128" className="w-full h-full"><path fill="#FFF" d="M64 0A64 64 0 1 1 0 64 64 64 0 0 1 64 0Zm20.45 93.36-31.5-44L52 48.24h-9.8v31.52h8V54.43l27.14 38.69h-5.23l25.54 36.32a63.55 63.55 0 0 0 16-11.83Zm11-45.12V48.24H83.82L96 66Zm0 0V48.24H83.82L96 66Z"/></svg>
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-200">Next.js</p>
                    <p className="text-xs text-zinc-500">{project.buildCommand}</p>
                  </div>
                </div>
                <Link href={`/dashboard/${project.id}/settings`} className="text-xs text-zinc-400 font-medium bg-zinc-800 px-3 py-1.5 rounded-full hover:bg-zinc-700">
                  Update
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="border border-zinc-800 rounded-xl bg-[#09090b] p-6">
              <h2 className="text-sm font-semibold text-zinc-100 mb-4">Git Repository</h2>
              {project.repository ? (
                <div className="flex flex-col gap-3">
                  <a href={project.repository} target="_blank" className="text-sm text-zinc-300 hover:text-white flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                    {project.repository.replace('https://github.com/', '')}
                  </a>
                  <p className="text-xs text-zinc-500 mt-2">Pushes to <span className="text-zinc-300">main</span> will trigger a new deployment automatically.</p>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">No Git repository connected.</p>
              )}
            </div>

            <div className="border border-zinc-800 rounded-xl bg-[#09090b] p-6">
              <h2 className="text-sm font-semibold text-zinc-100 mb-4">Domains</h2>
              <ul className="text-sm space-y-3">
                <li className="flex items-center gap-2 text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  {displayUrl}
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
