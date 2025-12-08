'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import styles from './page.module.css';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslations();

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <p>{t('common.loading')}</p>
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
            {t('home.heroTitle')}
          </h1>
          <p className={styles.heroDescription}>
            {t('home.heroDescription')}
          </p>
          <div className={styles.heroActions}>
            {user ? (
              <>
                <Link href="/users" className={styles.heroPrimaryButton}>
                  {t('home.discoverCyclists')}
                </Link>
                <Link href="/profile" className={styles.heroSecondaryButton}>
                  {t('home.myProfile')}
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className={styles.heroPrimaryButton}>
                  {t('home.joinNow')}
                </Link>
                <Link href="/login" className={styles.heroSecondaryButton}>
                  {t('home.signIn')}
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
        <h2 className={styles.sectionTitle}>{t('home.featuresTitle')}</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🗺️</div>
            <h3 className={styles.featureTitle}>{t('home.discoverRoutes')}</h3>
            <p className={styles.featureDescription}>
              {t('home.discoverRoutesDesc')}
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>👥</div>
            <h3 className={styles.featureTitle}>{t('home.connect')}</h3>
            <p className={styles.featureDescription}>
              {t('home.connectDesc')}
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3 className={styles.featureTitle}>{t('home.trackProgress')}</h3>
            <p className={styles.featureDescription}>
              {t('home.trackProgressDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className={styles.community}>
        <div className={styles.communityContent}>
          <h2 className={styles.communityTitle}>{t('home.communityTitle')}</h2>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>10K+</div>
              <div className={styles.statLabel}>{t('home.activeCyclists')}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>50K+</div>
              <div className={styles.statLabel}>{t('home.routesShared')}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>100+</div>
              <div className={styles.statLabel}>{t('home.cities')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Types of Cycling */}
      <section className={styles.cyclingTypes}>
        <h2 className={styles.sectionTitle}>{t('home.allTypesTitle')}</h2>
        <div className={styles.typesGrid}>
          <div className={styles.typeCard}>
            <div className={styles.typeEmoji}>🚵</div>
            <h3>{t('home.mountainBiking')}</h3>
            <p>{t('home.mountainBikingDesc')}</p>
          </div>
          <div className={styles.typeCard}>
            <div className={styles.typeEmoji}>🚴</div>
            <h3>{t('home.roadCycling')}</h3>
            <p>{t('home.roadCyclingDesc')}</p>
          </div>
          <div className={styles.typeCard}>
            <div className={styles.typeEmoji}>🌄</div>
            <h3>{t('home.gravelRiding')}</h3>
            <p>{t('home.gravelRidingDesc')}</p>
          </div>
          <div className={styles.typeCard}>
            <div className={styles.typeEmoji}>⚡</div>
            <h3>{t('home.eBiking')}</h3>
            <p>{t('home.eBikingDesc')}</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>{t('home.ctaTitle')}</h2>
          <p className={styles.ctaDescription}>
            {t('home.ctaDescription')}
          </p>
          <Link href="/register" className={styles.ctaButton}>
            {t('home.getStartedFree')}
          </Link>
        </section>
      )}
    </main>
  );
}
