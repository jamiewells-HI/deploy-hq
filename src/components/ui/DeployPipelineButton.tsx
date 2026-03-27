'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeployPipelineButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDeploy = async () => {
    setLoading(true);
    try {
      // Hit the deployment endpoint to queue the build
      await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId, repo: "test/repo", branch: "main" })
      });
      
      // Auto-refresh the dashboard to show the new deployment row
      router.refresh();
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDeploy} 
      disabled={loading}
      className="bg-white text-black font-semibold px-5 py-2 rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-zinc-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        "Redeploy"
      )}
    </button>
  );
}
