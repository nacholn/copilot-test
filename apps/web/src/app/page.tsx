'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { PublicPostCard } from '../components/PublicPostCard';
import { PublicGroupCard } from '../components/PublicGroupCard';
import { Loader } from '../components/Loader';
import type { PostWithDetails, GroupWithMemberCount } from '@cyclists/config';
import styles from './page.module.css';

function HomeInner() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslations();
  const [latestPosts, setLatestPosts] = useState<PostWithDetails[]>([]);
  const [popularGroups, setPopularGroups] = useState<GroupWithMemberCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        // Fetch latest posts
        const postsResponse = await fetch(`${apiUrl}/api/posts/public?limit=6`);
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          if (postsData.success) {
            setLatestPosts(postsData.data);
          }
        }

        // Fetch popular groups
        const groupsResponse = await fetch(
          `${apiUrl}/api/groups/public?limit=6&orderBy=member_count`
        );
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json();
          if (groupsData.success) {
            setPopularGroups(groupsData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching public data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicData();
  }, []);

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <Loader fullScreen message={t('common.loading')} />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{t('home.heroTitle')}</h1>
          <p className={styles.heroDescription}>{t('home.heroDescription')}</p>
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
            <p className={styles.featureDescription}>{t('home.discoverRoutesDesc')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>👥</div>
            <h3 className={styles.featureTitle}>{t('home.connect')}</h3>
            <p className={styles.featureDescription}>{t('home.connectDesc')}</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3 className={styles.featureTitle}>{t('home.trackProgress')}</h3>
            <p className={styles.featureDescription}>{t('home.trackProgressDesc')}</p>
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

      {/* Latest Posts Section */}
      {!loading && latestPosts.length > 0 && (
        <section className={styles.postsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Latest Posts</h2>
            <Link href="/posts" className={styles.seeAllLink}>
              See all →
            </Link>
          </div>
          <div className={styles.postsGrid}>
            {latestPosts.map((post) => (
              <PublicPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Groups Section */}
      {!loading && popularGroups.length > 0 && (
        <section className={styles.groupsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Popular Groups</h2>
            <Link href="/groups" className={styles.seeAllLink}>
              See all →
            </Link>
          </div>
          <div className={styles.groupsGrid}>
            {popularGroups.map((group) => (
              <PublicGroupCard key={group.id} group={group} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!user && (
        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>{t('home.ctaTitle')}</h2>
          <p className={styles.ctaDescription}>{t('home.ctaDescription')}</p>
          <Link href="/register" className={styles.ctaButton}>
            {t('home.getStartedFree')}
          </Link>
        </section>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<Loader fullScreen message="Loading..." />}>
      <HomeInner />
    </Suspense>
  );
}
