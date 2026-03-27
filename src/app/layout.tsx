import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';

export const metadata: Metadata = {
  title: 'DeployHQ | Cloud Infrastructure',
  description: 'A modern platform to deploy web applications instantly.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  // Valid auth cookie stores a UUID. As long as it's present and truthy, user is authed.
  const isAuthenticated = !!cookieStore.get('auth')?.value;

  return (
    <html lang="en">
      <body className="bg-black text-white antialiased min-h-screen flex flex-col">
        <header className="border-b border-zinc-800 bg-[#09090b] sticky top-0 z-50">
          <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
            
            <div className="flex items-center gap-8">
              <a href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
                <span className="font-bold tracking-tight text-lg">DeployHQ</span>
              </a>

              {isAuthenticated && (
                <nav className="hidden md:flex gap-6">
                  <a href="/dashboard" className="text-sm font-medium text-white transition-colors hover:text-zinc-300">Projects</a>
                  <a href="#" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">Activity</a>
                  <a href="#" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">Settings</a>
                </nav>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <form action="/actions/auth/logout" method="post">
                    <button formAction={async () => {
                      'use server';
                      const { logout } = await import('./actions/auth');
                      await logout();
                    }} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                      Sign Out
                    </button>
                  </form>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-sm">
                    J
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4 text-sm font-medium">
                  <a href="/login" className="text-zinc-300 hover:text-white transition-colors">Log In</a>
                  <a href="/signup" className="bg-white text-black px-4 py-2 rounded-md hover:bg-zinc-200 transition-colors">Sign Up</a>
                </div>
              )}
            </div>

          </div>
        </header>

        <main className="flex-1 w-full bg-black">
          {children}
        </main>
      </body>
    </html>
  );
}
