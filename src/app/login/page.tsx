'use client';

import { useActionState, useState } from 'react';
import { login, register } from '../actions/auth';
import styles from './page.module.css';

// Check if github is actively configured on render
export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginState, loginAction, isLoginPending] = useActionState(login, null);
  const [registerState, registerAction, isRegisterPending] = useActionState(register, null);

  // We fetch this securely down to the client component. In Next 15, exposing process.env 
  // without NEXT_PUBLIC in client components is undefined, but Next automatically inlines it
  // if available. For absolute security, this form should ideally be a server component, but 
  // since it uses useActionState, we check NEXT_PUBLIC bindings or trust build-time string substitution.
  // We'll check if the client ID exists and isn't the dummy template string.
  const isGithubConfigured = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID && process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID !== 'your-github-client-id';

  const activeError = isRegistering ? registerState?.error : loginState?.error;
  const isPending = isRegisterPending || isLoginPending;

  return (
    <div className={styles.loginContainer}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className={styles.title}>{isRegistering ? 'Create an account' : 'Welcome back'}</h1>
          <p className={styles.subtitle}>{isRegistering ? 'Start deploying your apps today.' : 'Sign in to DeployHQ.'}</p>
        </div>

        {activeError && (
          <div className={styles.errorMessage}>
            {activeError}
          </div>
        )}

        <form action={isRegistering ? registerAction : loginAction} className={styles.formGroup}>
          <input 
            type="email" 
            name="email" 
            placeholder="name@company.com" 
            required 
            className={styles.inputField} 
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Your secure password" 
            required 
            className={styles.inputField} 
          />

          <button className={styles.authButton} type="submit" disabled={isPending}>
            {isPending ? 'Authenticating...' : (isRegistering ? 'Sign up' : 'Sign in')}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or securely using SSO</span>
        </div>

        {isGithubConfigured && (
          <form action="/api/auth/github" className={styles.form}>
            <button className={`${styles.authButton} ${styles.oauthButton}`} type="button" onClick={() => alert('GitHub OAuth not yet routed.')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.btnIcon}>
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              Continue with GitHub
            </button>
          </form>
        )}

        <p className={styles.footerText}>
          {isRegistering ? "Already have an account?" : "Don't have an account?"}
          <button type="button" onClick={() => setIsRegistering(!isRegistering)} className={styles.linkButton}>
            {isRegistering ? ' Sign in' : ' Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
