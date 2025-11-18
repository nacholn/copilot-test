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
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Your Cycling Adventure Starts Here
          </h1>
          <p className={styles.heroDescription}>
            Join thousands of cyclists sharing routes, making friends, and pushing their limits together
          </p>
          <div className={styles.heroActions}>
            {user ? (
              <>
                <Link href="/users" className={styles.heroPrimaryButton}>
                  Discover Cyclists
                </Link>
                <Link href="/profile" className={styles.heroSecondaryButton}>
                  My Profile
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className={styles.heroPrimaryButton}>
                  Join Now
                </Link>
                <Link href="/login" className={styles.heroSecondaryButton}>
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
        <div className={styles.heroImageContainer}>
          <div className={styles.heroImagePlaceholder}>
            <span className={styles.heroEmoji}>🚴‍♂️</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Everything You Need</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🗺️</div>
            <h3 className={styles.featureTitle}>Discover Routes</h3>
            <p className={styles.featureDescription}>
              Explore scenic cycling routes shared by the community. From mountain trails to coastal roads.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>👥</div>
            <h3 className={styles.featureTitle}>Connect</h3>
            <p className={styles.featureDescription}>
              Find cycling partners near you. Match with riders based on skill level and bike type.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3 className={styles.featureTitle}>Track Progress</h3>
            <p className={styles.featureDescription}>
              Monitor your rides, set goals, and celebrate achievements with your cycling community.
            </p>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className={styles.community}>
        <div className={styles.communityContent}>
          <h2 className={styles.communityTitle}>Join Our Community</h2>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>10K+</div>
              <div className={styles.statLabel}>Active Cyclists</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>50K+</div>
              <div className={styles.statLabel}>Routes Shared</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>100+</div>
              <div className={styles.statLabel}>Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Types of Cycling */}
      <section className={styles.cyclingTypes}>
        <h2 className={styles.sectionTitle}>All Types of Cycling</h2>
        <div className={styles.typesGrid}>
          <div className={styles.typeCard}>
            <div className={styles.typeEmoji}>🚵</div>
            <h3>Mountain Biking</h3>
            <p>Conquer trails and rough terrain</p>
          </div>
          <div className={styles.typeCard}>
            <div className={styles.typeEmoji}>🚴</div>
            <h3>Road Cycling</h3>
            <p>Speed and endurance on paved roads</p>
          </div>
          <div className={styles.typeCard}>
            <div className={styles.typeEmoji}>🌄</div>
            <h3>Gravel Riding</h3>
            <p>Adventure on mixed terrain</p>
          </div>
          <div className={styles.typeCard}>
            <div className={styles.typeEmoji}>⚡</div>
            <h3>E-Biking</h3>
            <p>Electric-assisted cycling fun</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>Ready to Ride?</h2>
          <p className={styles.ctaDescription}>
            Create your profile and start connecting with cyclists today
          </p>
          <Link href="/register" className={styles.ctaButton}>
            Get Started Free
          </Link>
        </section>
      )}
    </main>
  );
}
