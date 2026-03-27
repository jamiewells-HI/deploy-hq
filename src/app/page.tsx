import Link from 'next/link';
import styles from './page.module.css';

export default function WelcomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.badge}>Next Generation PaaS</div>
        <h1 className={styles.title}>
          Deploy Web Applications <br />
          <span className={styles.highlight}>Without the Magic</span>
        </h1>
        <p className={styles.description}>
          The robust, scalable, and developer-first deployment platform. Push your code
          to GitHub, configure your environment, and let us handle exactly what you instruct us to.
        </p>
        <div className={styles.ctaGroup}>
          <Link href="/login" className={styles.primaryButton}>
            Start Deploying
          </Link>
          <a href="#features" className={styles.secondaryButton}>
            View Documentation
          </a>
        </div>
      </div>

      <div className={styles.features} id="features">
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>⚡</div>
          <h3 className={styles.featureTitle}>Instant Deploys</h3>
          <p className={styles.featureDesc}>Automatic pull and build on every push to your repository.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🌍</div>
          <h3 className={styles.featureTitle}>Custom Domains</h3>
          <p className={styles.featureDesc}>Map your own domain names securely with auto Let's Encrypt SSL.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>🛡️</div>
          <h3 className={styles.featureTitle}>Shared CPU Tier</h3>
          <p className={styles.featureDesc}>Get started for free on our robust shared pool, then scale explicitly.</p>
        </div>
      </div>
    </div>
  );
}
