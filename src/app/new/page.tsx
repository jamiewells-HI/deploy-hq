'use client';

import { useEffect, useState } from 'react';
import { createTemplateProject, uploadLocalProject } from '../actions/project';
import { getGithubRepositories } from '../actions/github';
import Link from 'next/link';

export default function NewProject() {
  const [tab, setTab] = useState<'github' | 'templates' | 'upload'>('github');
  const [folderName, setFolderName] = useState<string | null>(null);
  const [fileCount, setFileCount] = useState<number>(0);
  const [repos, setRepos] = useState<any[] | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(true);

  useEffect(() => {
    async function fetchRepos() {
      const data = await getGithubRepositories();
      setRepos(data);
      setLoadingRepos(false);
      if (!data) setTab('templates'); // Fallback if no github
    }
    fetchRepos();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileCount(e.target.files.length);
      const firstPath = e.target.files[0].webkitRelativePath;
      if (firstPath) {
        setFolderName(firstPath.split('/')[0]);
      } else {
        setFolderName('Local Project');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col justify-center items-center px-4 font-sans bg-black">
      <div className="w-full max-w-2xl border border-zinc-800 bg-[#09090b] rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300">
        
        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50">
          <button 
            onClick={() => setTab('github')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${tab === 'github' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Import Repository
          </button>
          <button 
            onClick={() => setTab('templates')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${tab === 'templates' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Templates
          </button>
          <button 
            onClick={() => setTab('upload')}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${tab === 'upload' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Upload
          </button>
        </div>

        <div className="p-8 md:p-10">
          {tab === 'github' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Import Git Repository</h1>
                <p className="text-sm text-zinc-400">Select a repository to deploy instantly with full pipeline logs.</p>
              </div>

              {loadingRepos ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-6 h-6 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin"></div>
                  <p className="text-sm text-zinc-500 font-medium">Fetching repositories from GitHub...</p>
                </div>
              ) : !repos ? (
                <div className="text-center py-8 px-6 bg-zinc-900/40 border border-zinc-800 rounded-xl">
                  <h3 className="text-zinc-200 font-semibold mb-2">GitHub Not Connected</h3>
                  <p className="text-xs text-zinc-500 mb-6">Connect your GitHub account to import and deploy your repositories directly from our dashboard.</p>
                  <Link 
                    href="/api/auth/github"
                    className="bg-white text-black px-5 py-2.5 rounded-md text-sm font-bold hover:bg-zinc-200 transition-colors inline-block"
                  >
                    Connect GitHub
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {repos.map((repo) => (
                    <div key={repo.id} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-600 transition group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 flex items-center justify-center bg-black border border-zinc-800 rounded">
                           <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-zinc-200 truncate">{repo.name}</h4>
                          <p className="text-[10px] text-zinc-600 font-mono truncate">{repo.full_name}</p>
                        </div>
                        {repo.private && <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded uppercase font-bold">Private</span>}
                      </div>

                      <form action={createTemplateProject}>
                        <input type="hidden" name="name" value={repo.name} />
                        <input type="hidden" name="repo" value={repo.url} />
                        <button type="submit" className="text-xs bg-zinc-100 hover:bg-white text-black font-bold px-3.5 py-1.5 rounded-md transition transform group-hover:scale-105">
                          Import
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'templates' && (
            <>
              <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-3">Install a Template</h1>
                <p className="text-sm text-zinc-400">Deploy an advanced Next.js template instantly simulating the production pipeline.</p>
              </div>

              <form action={createTemplateProject} className="flex flex-col gap-6">
                <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 p-4 rounded-lg hover:border-zinc-700 transition duration-200">
                  <svg viewBox="0 0 128 128" className="w-10 h-10 p-1.5 bg-black rounded-md border border-zinc-800"><path fill="#FFF" d="M64 0A64 64 0 1 1 0 64 64 64 0 0 1 64 0Zm20.45 93.36-31.5-44L52 48.24h-9.8v31.52h8V54.43l27.14 38.69h-5.23l25.54 36.32a63.55 63.55 0 0 0 16-11.83Zm11-45.12V48.24H83.82L96 66Zm0 0V48.24H83.82L96 66Z"/></svg>
                  <div className="flex-1">
                    <h3 className="text-zinc-100 font-semibold mb-1">Next.js Boilerplate</h3>
                    <p className="text-xs text-zinc-500 font-mono hidden sm:block">github.com/vercel/next.js/tree/canary/examples</p>
                  </div>
                  <div className="text-xs text-zinc-400 bg-black px-2.5 py-1 rounded border border-zinc-800">App Router</div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">Project Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    defaultValue="deployhq-demo-app" 
                    className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-lg text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all shadow-sm"
                  />
                </div>

                <input type="hidden" name="repo" value="https://github.com/vercel/next.js" />
                
                <button type="submit" className="w-full mt-4 bg-white text-zinc-950 font-bold shadow-sm py-3 rounded-lg text-sm transition-all hover:bg-zinc-200 active:scale-[0.98]">
                  Deploy Repository
                </button>
              </form>
            </>
          )}

          {tab === 'upload' && (
            <>
              <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-3">Upload Source Code</h1>
                <p className="text-sm text-zinc-400">Drag and drop your project directory or a .zip archive securely to our cloud.</p>
              </div>

              <form action={uploadLocalProject} className="flex flex-col gap-6">
                
                <label className="relative border-2 border-dashed border-zinc-800 hover:border-zinc-500 rounded-xl bg-zinc-950/50 p-12 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                  {/* @ts-expect-error non-standard but required for folder uploads */}
                  <input type="file" name="files" multiple webkitdirectory="" onChange={handleFileChange} className="hidden" />
                  <input type="hidden" name="folderName" value={folderName || "Local Project"} />
                  <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  {folderName ? (
                    <div className="text-center">
                      <h3 className="text-emerald-400 font-medium mb-1">Project Directory Selected</h3>
                      <p className="text-zinc-500 text-xs font-mono">{folderName}/ ({fileCount} files)</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h3 className="text-zinc-200 font-medium mb-1 line-clamp-1">Click to select folder</h3>
                      <p className="text-zinc-500 text-xs">Recursively uploads application directories securely</p>
                    </div>
                  )}
                </label>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">Project Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    defaultValue={folderName ? folderName.toLowerCase().replace(/\s+/g, '-') : "local-upload-app"} 
                    className="w-full px-4 py-3 bg-[#09090b] border border-zinc-800 rounded-lg text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all shadow-sm"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={!folderName}
                  className="w-full mt-4 bg-white disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold shadow-sm py-3 rounded-lg text-sm transition-all hover:bg-zinc-200 active:scale-[0.98]"
                >
                  Upload & Deploy
                </button>
              </form>
            </>
          )}

          <p className="mt-8 text-center text-xs text-zinc-500">
            <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">← Cancel and return to Dashboard</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
