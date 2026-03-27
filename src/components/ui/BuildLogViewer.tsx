'use client';

import { useEffect, useState } from 'react';
import { getLatestDeployment } from '@/app/actions/deployments';

type Deployment = { id: string, status: string, commitHash: string | null, createdAt: Date };

export default function BuildLogViewer({ projectId, initialDeployments }: { projectId: string, initialDeployments: Deployment[] }) {
  const [deployment, setDeployment] = useState<Deployment | null>(initialDeployments[0] || null);
  const isBuilding = deployment?.status === 'BUILDING' || deployment?.status === 'QUEUED';
  const isSuccess = deployment?.status === 'SUCCESS';
  
  // Real Deployment Polling Pipeline
  useEffect(() => {
    if (!isBuilding) return;

    let interval = setInterval(async () => {
      const latest = await getLatestDeployment(projectId);
      if (latest) {
        setDeployment(latest);
        if (latest.status !== 'BUILDING' && latest.status !== 'QUEUED') {
          clearInterval(interval);
        }
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [projectId, isBuilding]);

  // Vercel-like status array (Simulated progression based on time/status)
  // In a full production app, BullMQ emits these discrete stage updates via WebSocket
  const stages = [
    { label: "Queued", active: isBuilding || isSuccess, done: isBuilding || isSuccess },
    { label: "Building", active: isBuilding || isSuccess, done: isSuccess },
    { label: "Assigning Domains", active: isSuccess, done: isSuccess },
  ];

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      <div className="flex border-b border-zinc-800 bg-[#09090b] px-4">
        {['Deployment Pipeline'].map((tab) => (
          <button key={tab} className="text-sm text-zinc-100 font-medium px-4 py-3 border-b-2 border-white">
            {tab}
          </button>
        ))}
      </div>
      
      <div className="p-6">
        {!deployment ? (
          <div className="text-sm text-zinc-500 py-4">No deployments yet. Click Redeploy to start!</div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-6">
              <div className="flex items-center gap-3">
                {isBuilding ? (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                ) : isSuccess ? (
                  <span className="flex h-3 w-3 relative">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  </span>
                ) : (
                  <span className="flex h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                )}
                
                <h3 className="font-medium text-white">
                  {isBuilding ? 'Building' : isSuccess ? 'Ready' : 'Failed'}
                </h3>
              </div>
              <span className="text-zinc-500 text-sm font-mono">{deployment.id.substring(0, 8)}</span>
            </div>
            
            <div className="space-y-4">
              {stages.map((stage, idx) => (
                <div key={idx} className={`flex items-start gap-4 ${!stage.active ? 'opacity-40 grayscale' : ''}`}>
                  <div className="relative flex flex-col items-center mt-1">
                    {stage.done && isSuccess ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    ) : stage.active && isBuilding ? (
                      <div className="w-5 h-5 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin"></div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-zinc-700"></div>
                    )}
                    
                    {/* Visual Line connector */}
                    {idx < stages.length - 1 && (
                      <div className="w-0.5 h-6 bg-zinc-800 my-1"></div>
                    )}
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${stage.done && isSuccess ? 'text-zinc-300' : 'text-zinc-100'}`}>{stage.label}</h4>
                    {stage.active && isBuilding && <p className="text-xs text-zinc-500 mt-0.5">Running Cloudflare Build Workers...</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Fake Log Terminal view simulating Wrangler deployments */}
            <div className="mt-8 bg-[#09090b] border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-400 h-[150px] overflow-y-auto">
              {isBuilding && (
                <div className="animate-pulse space-y-2">
                  <p className="text-zinc-500">&gt; npm install</p>
                  <p className="text-emerald-400">added 452 packages in 3s</p>
                  <p className="text-zinc-500 mt-2">&gt; npm run build</p>
                  <p className="text-zinc-300">Creating an optimized production build...</p>
                  <p className="text-blue-400 mt-2">Uploading to Cloudflare Pages ☁️</p>
                </div>
              )}
              {isSuccess && (
                <div className="space-y-2">
                  <p className="text-emerald-400 border-b border-zinc-800 pb-2 mb-2">Build successfully triggered via API route. (1200ms)</p>
                  <p>✔ Deployed to Cloudflare infrastructure natively.</p>
                  <p className="text-white mt-4">Done in 12.0s.</p>
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
