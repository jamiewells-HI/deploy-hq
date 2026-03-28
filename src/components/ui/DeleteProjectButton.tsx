'use client';

import { useState } from 'react';
import { deleteProject } from '@/app/actions/project';

interface DeleteProjectButtonProps {
  projectId: string;
  projectName: string;
}

export default function DeleteProjectButton({ projectId, projectName }: DeleteProjectButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    if (confirmName !== projectName) return;
    
    setIsDeleting(true);
    try {
      await deleteProject(projectId);
    } catch (error) {
      console.error('Delete failed:', error);
      setIsDeleting(false);
      alert('Failed to delete project. Please try again.');
    }
  }

  if (!showConfirm) {
    return (
      <button 
        onClick={() => setShowConfirm(true)}
        className="bg-red-500 text-white hover:bg-red-600 font-semibold px-4 py-2 rounded-md text-sm transition-colors border border-red-500/50"
      >
        Delete {projectName}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-3 w-full">
      <div className="text-right">
        <p className="text-sm text-zinc-400 mb-2">Type <span className="text-white font-mono select-none">{projectName}</span> to confirm:</p>
        <input 
          type="text" 
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          placeholder={projectName}
          className="bg-black border border-red-500/20 text-sm text-zinc-200 rounded-md px-3 py-2 outline-none focus:border-red-500/50 w-64"
        />
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => setShowConfirm(false)}
          className="text-zinc-400 hover:text-white text-sm font-medium px-3 py-2"
        >
          Cancel
        </button>
        <button 
          onClick={handleDelete}
          disabled={confirmName !== projectName || isDeleting}
          className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold px-4 py-2 rounded-md text-sm transition-colors border border-red-500/50"
        >
          {isDeleting ? 'Deleting...' : 'Permanently Delete'}
        </button>
      </div>
    </div>
  );
}
