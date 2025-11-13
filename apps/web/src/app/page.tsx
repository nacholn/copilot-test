'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import styles from './page.module.css';

export default function Home() {
  const { user, loading: authLoading } = useAuth();

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <p>Loading...</p>
        </div>
      </main>
    );
  }
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>🚴 Cyclists Social Network</h1>
        <p className={styles.description}>
          Connect with fellow cyclists, share routes, and build your cycling community
        </p>
        <div className={styles.actions}>
          {user ? (
            // Show different actions for authenticated users
            <>
              <Link href="/profile" className={styles.primaryButton}>
                View Profile
              </Link>
              <Link href="/users" className={styles.secondaryButton}>
                All Users
              </Link>
              <Link href="/friends" className={styles.secondaryButton}>
                My Friends
              </Link>
            </>
          ) : (
            // Show registration/login for non-authenticated users
            <>
              <Link href="/register" className={styles.primaryButton}>
                Get Started
              </Link>
              <Link href="/login" className={styles.secondaryButton}>
                Sign In
              </Link>
            </>
          )}
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
