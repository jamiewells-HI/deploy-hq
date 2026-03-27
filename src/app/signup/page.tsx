'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { register } from '../actions/auth';

export default function SignupPage() {
  const [registerState, registerAction, isPending] = useActionState(register, null);

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-[400px] border border-zinc-800 bg-[#09090b] rounded-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-lg mb-6">
            <svg className="w-6 h-6 text-zinc-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Create your account</h1>
          <p className="text-sm text-zinc-400">Start deploying your apps today.</p>
        </div>

        {/* Error State */}
        {registerState?.error && (
          <div className="w-full p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-sm text-center">
            {registerState.error}
          </div>
        )}

        {/* Sign Up Form */}
        <form action={registerAction} className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300 ml-1">Email Address</label>
            <input 
              type="email" 
              name="email" 
              placeholder="name@company.com" 
              required 
              className="w-full px-4 py-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300 ml-1">Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Your secure password" 
              required 
              className="w-full px-4 py-2.5 bg-[#09090b] border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full mt-2 bg-zinc-100 text-zinc-950 font-semibold py-2.5 rounded-lg text-sm transition-all hover:bg-white active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Preparing workspace...' : 'Sign up'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-b border-zinc-800"></div>
          <span className="px-3 text-xs text-zinc-500 uppercase tracking-wider">or sign up with</span>
          <div className="flex-1 border-b border-zinc-800"></div>
        </div>

        {/* GitHub Auth Check via Env in UI */}
        <form action="/api/auth/github" method="POST">
          <button 
            type="button" 
            onClick={() => alert('SSO OAuth currently mocked')}
            className="w-full flex items-center justify-center gap-3 bg-transparent border border-zinc-800 text-zinc-200 font-medium py-2.5 rounded-lg text-sm transition-colors hover:bg-zinc-900"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            Continue with GitHub
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-zinc-200 font-medium hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
