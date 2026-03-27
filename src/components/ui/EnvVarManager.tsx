'use client';

import { useState } from 'react';
import { upsertEnvVars, deleteEnvVar } from '@/app/actions/project';

interface EnvVar {
  id: string;
  key: string;
  value: string;
}

export default function EnvVarManager({ projectId, initialVars }: { projectId: string; initialVars: EnvVar[] }) {
  const [vars, setVars] = useState<EnvVar[]>(initialVars);
  const [mode, setMode] = useState<'individual' | 'bulk'>('individual');
  const [bulkText, setBulkText] = useState('');
  const [singleKey, setSingleKey] = useState('');
  const [singleValue, setSingleValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBulkAdd = async () => {
    setLoading(true);
    const lines = bulkText.split('\n');
    const parsed: { key: string; value: string }[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      
      let key, value;
      if (trimmed.includes('=')) {
        [key, ...value] = trimmed.split('=');
        parsed.push({ key: key.trim(), value: value.join('=').trim().replace(/^["']|["']$/g, '') });
      }
    });

    try {
      await upsertEnvVars(projectId, parsed);
      window.location.reload(); // Refresh to get proper IDs from prisma for new vars
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleAdd = async () => {
    if (!singleKey) return;
    setLoading(true);
    try {
      await upsertEnvVars(projectId, [{ key: singleKey, value: singleValue }]);
      window.location.reload();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this variable?")) return;
    await deleteEnvVar(id);
    setVars(vars.filter(v => v.id !== id));
  };

  return (
    <div className="border border-zinc-800 bg-[#09090b] rounded-xl overflow-hidden shadow-sm" id="env">
      <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-1">Environment Variables</h2>
          <p className="text-sm text-zinc-400">Manage secrets for your application builds.</p>
        </div>
        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button 
            onClick={() => setMode('individual')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${mode === 'individual' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Form
          </button>
          <button 
            onClick={() => setMode('bulk')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${mode === 'bulk' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Raw (.env)
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {mode === 'individual' ? (
          <div className="flex gap-4">
            <input 
              placeholder="KEY (e.g. DATABASE_URL)" 
              value={singleKey}
              onChange={(e) => setSingleKey(e.target.value.toUpperCase())}
              className="flex-1 font-mono uppercase bg-black border border-zinc-800 text-sm text-zinc-200 rounded-md px-3 py-2 outline-none focus:border-zinc-500 placeholder-zinc-700" 
            />
            <input 
              placeholder="VALUE" 
              type="password"
              value={singleValue}
              onChange={(e) => setSingleValue(e.target.value)}
              className="flex-1 font-mono bg-black border border-zinc-800 text-sm text-zinc-200 rounded-md px-3 py-2 outline-none focus:border-zinc-500 placeholder-zinc-700" 
            />
            <button 
              onClick={handleSingleAdd}
              disabled={loading}
              className="bg-zinc-100 text-black px-4 py-2 font-medium text-sm rounded-md shadow-sm hover:bg-white transition"
            >
              Add
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea 
              placeholder="PASTE YOUR .ENV FILE CONTENTS HERE&#10;KEY1=VALUE1&#10;KEY2=VALUE2"
              rows={6}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full font-mono bg-black border border-zinc-800 text-sm text-zinc-200 rounded-md px-4 py-3 outline-none focus:border-zinc-500 placeholder-zinc-700 resize-none"
            />
            <div className="flex justify-end">
              <button 
                onClick={handleBulkAdd}
                disabled={loading}
                className="bg-emerald-500 text-white px-5 py-2 font-semibold text-sm rounded-md shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition"
              >
                {loading ? 'Importing...' : 'Bulk Import & Save'}
              </button>
            </div>
          </div>
        )}

        {vars.length > 0 && (
          <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <div className="bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-400 tracking-wider flex border-b border-zinc-800 uppercase">
              <div className="flex-1">Key</div>
              <div className="flex-1">Value</div>
              <div className="w-10"></div>
            </div>
            {vars.map(v => (
              <div key={v.id} className="bg-black px-4 py-3 text-sm font-mono text-zinc-300 flex items-center border-b border-zinc-800/60 last:border-0 hover:bg-zinc-950/50 transition">
                <div className="flex-1 text-emerald-400 font-bold truncate pr-4 min-w-0">{v.key}</div>
                <div className="flex-1 tracking-[4px] text-zinc-600 truncate min-w-0">•••••••••••••••••</div>
                <button 
                  onClick={() => handleDelete(v.id)}
                  className="text-zinc-700 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
