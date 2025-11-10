'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>🚴 Cyclists Social Network</h1>
        <p className={styles.description}>
          Connect with fellow cyclists, share routes, and build your cycling community
        </p>
        
        <div className={styles.actions}>
          <Link href="/register" className={styles.primaryButton}>
            Get Started
          </Link>
          <Link href="/login" className={styles.secondaryButton}>
            Sign In
          </Link>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>🗺️ Discover Routes</h3>
            <p>Find the best cycling routes in your area</p>
          </div>
          <div className={styles.feature}>
            <h3>👥 Connect</h3>
            <p>Meet cyclists with similar interests</p>
          </div>
          <div className={styles.feature}>
            <h3>📊 Track Progress</h3>
            <p>Monitor your cycling journey</p>
          </div>
        </div>
      </div>
    </main>
  );
}
