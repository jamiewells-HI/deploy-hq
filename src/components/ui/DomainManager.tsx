'use client';

import { useState } from 'react';
import { addCustomDomain, deleteCustomDomain } from '@/app/actions/project';

interface Domain {
  id: string;
  hostname: string;
  status: string;
}

export default function DomainManager({ projectId, initialDomains }: { projectId: string, initialDomains: Domain[] }) {
  const [domains, setDomains] = useState<Domain[]>(initialDomains);
  const [newHostname, setNewHostname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!newHostname) return;
    setLoading(true);
    try {
      const added = await addCustomDomain(projectId, newHostname);
      setDomains([...domains, added]);
      setNewHostname('');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await deleteCustomDomain(id);
    setDomains(domains.filter(d => d.id !== id));
  };

  return (
    <div className="border border-zinc-800 bg-[#09090b] rounded-xl overflow-hidden shadow-sm" id="domains">
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">Domains</h2>
        <p className="text-sm text-zinc-400">Add custom domains to your project using CNAME or A records.</p>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="flex gap-4">
          <input 
            placeholder="example.com" 
            value={newHostname}
            onChange={(e) => setNewHostname(e.target.value)}
            className="flex-1 font-mono bg-black border border-zinc-800 text-sm text-zinc-200 rounded-md px-3 py-2 outline-none focus:border-zinc-500 placeholder-zinc-700" 
          />
          <button 
            onClick={handleAdd}
            disabled={loading}
            className="bg-zinc-100 text-black px-4 py-2 font-medium text-sm rounded-md shadow-sm hover:bg-white transition disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>

        {domains.length > 0 ? (
          <div className="space-y-4">
            {domains.map(domain => (
              <div key={domain.id} className="p-4 bg-black border border-zinc-800 rounded-lg flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-zinc-200">{domain.hostname}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      domain.status === 'ACTIVE' 
                        ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' 
                        : 'border-amber-500/50 text-amber-400 bg-amber-500/5'
                    }`}>
                      {domain.status}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(domain.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>

                <div className="text-xs space-y-2 border-t border-zinc-800/50 pt-3">
                  <p className="text-zinc-500 font-medium">DNS Configuration Required:</p>
                  <div className="grid grid-cols-3 gap-2 bg-zinc-900/50 p-2 rounded border border-zinc-800 font-mono">
                    <div className="text-zinc-600">Type</div>
                    <div className="text-zinc-600">Name</div>
                    <div className="text-zinc-600">Value</div>
                    <div className="text-zinc-300">CNAME</div>
                    <div className="text-zinc-300">@</div>
                    <div className="text-zinc-300 truncate text-blue-400">cname.deployhq.app</div>
                  </div>
                  <p className="text-[10px] text-zinc-600 italic">Wait up to 24 hours for DNS propagation (usually instant via Cloudflare SaaS).</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-zinc-600 text-sm italic">
            No custom domains added yet.
          </div>
        )}
      </div>
    </div>
  );
}
