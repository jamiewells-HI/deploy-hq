import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import DomainManager from '@/components/ui/DomainManager';
import EnvVarManager from '@/components/ui/EnvVarManager';
import DeleteProjectButton from '@/components/ui/DeleteProjectButton';

export default async function ProjectSettings({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get('auth')?.value;

  if (!userId) {
    redirect('/login');
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: { 
      domains: true,
      envVars: true 
    }
  });

  if (!project) {
    console.error(`[DeployHQ] Project with ID ${id} not found in DB.`);
    return <div className="text-white p-20 text-center">Project not found (ID: {id})</div>;
  }

  if (project.userId !== userId) {
    console.error(`[DeployHQ] Access denied for user ${userId} to project ${id}.`);
    return <div className="text-white p-20 text-center">Unauthorized access.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans">
      
      {/* Settings Navigation Header */}
      <div className="border-b border-zinc-800 bg-[#09090b]">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4 text-sm font-medium text-zinc-500 mb-6">
            <Link href="/dashboard" className="hover:text-zinc-200 transition-colors">Personal</Link>
            <span>/</span>
            <Link href={`/dashboard/${project.id}`} className="hover:text-zinc-200 transition-colors">{project.name}</Link>
            <span>/</span>
            <span className="text-zinc-100">Settings</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white m-0">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10 flex gap-12">
        {/* Settings Sidebar Menus */}
        <div className="w-64 flex flex-col gap-2">
          <button className="text-sm text-left text-zinc-100 font-medium px-3 py-2 bg-zinc-900 rounded-md">General</button>
          <button className="text-sm text-left text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 font-medium px-3 py-2 rounded-md">General</button>
          <button className="text-sm text-left text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 font-medium px-3 py-2 rounded-md">Environment Variables</button>
          <button className="text-sm text-left text-zinc-100 font-medium px-3 py-2 bg-zinc-900 rounded-md">Domains</button>
          <button className="text-sm text-left text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 font-medium px-3 py-2 rounded-md">Integrations</button>
        </div>

        {/* Main Settings Sections */}
        <div className="flex-1 space-y-10">

          <div className="border border-zinc-800 bg-[#09090b] rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-xl font-semibold text-zinc-100 mb-2">Build & Development Settings</h2>
              <p className="text-sm text-zinc-400">Control how DeployHQ builds and executes your code.</p>
            </div>
            
            <form className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-200">Framework Preset</label>
                <div className="relative">
                  <select defaultValue="nextjs" className="w-full appearance-none bg-black border border-zinc-800 text-sm text-zinc-200 rounded-md px-3 py-2.5 outline-none focus:border-zinc-500">
                    <option value="nextjs">Next.js</option>
                    <option value="vite">Vite</option>
                    <option value="cra">Create React App</option>
                    <option value="node">Node.js Server</option>
                  </select>
                  <svg className="absolute right-3 top-3 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-200">Build Command</label>
                  <input defaultValue={project.buildCommand || ''} placeholder="npm run build" className="w-full font-mono bg-black border border-zinc-800 text-sm text-zinc-200 rounded-md px-3 py-2.5 outline-none focus:border-zinc-500 placeholder-zinc-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-200">Output Directory</label>
                  <input defaultValue={project.outputDir || ''} placeholder=".next" className="w-full font-mono bg-black border border-zinc-800 text-sm text-zinc-200 rounded-md px-3 py-2.5 outline-none focus:border-zinc-500 placeholder-zinc-700" />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end">
                <button type="button" className="bg-white text-black font-semibold px-4 py-2 rounded-md text-sm hover:bg-zinc-200 transition-colors">Save configurations</button>
              </div>
            </form>
          </div>

          <EnvVarManager projectId={project.id} initialVars={project.envVars as any} />

          <DomainManager projectId={project.id} initialDomains={project.domains as any} />

          <div className="border border-red-500/20 bg-red-500/5 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-red-500 mb-2">Delete Project</h2>
              <p className="text-sm text-zinc-400 mb-6 max-w-lg">The project will be permanently deleted along with its entire deployment history. This action cannot be officially undone.</p>
              
              <div className="flex justify-end">
                <DeleteProjectButton projectId={project.id} projectName={project.name} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
