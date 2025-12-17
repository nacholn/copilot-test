'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from '../../hooks/useTranslations';
import { PublicGroupCard } from '../../components/cards/PublicGroupCard';
import { Loader } from '../../components/ui/Loader';
import type { GroupWithMemberCount } from '@bicicita/config';
import styles from './groups.module.css';

const GROUPS_PER_PAGE = 12;

export default function PublicGroups() {
  const { t } = useTranslations();
  const [groups, setGroups] = useState<GroupWithMemberCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [orderBy, setOrderBy] = useState<'created_at' | 'member_count'>('member_count');

  const fetchGroups = useCallback(
    async (currentOffset: number, append: boolean = false, currentOrderBy: string = orderBy) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(
          `${apiUrl}/api/groups/public?limit=${GROUPS_PER_PAGE}&offset=${currentOffset}&orderBy=${currentOrderBy}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }

        const data = await response.json();

        if (data.success) {
          const newGroups = data.data;

          if (append) {
            setGroups((prev) => [...prev, ...newGroups]);
          } else {
            setGroups(newGroups);
          }

          // If we received fewer groups than requested, we've reached the end
          setHasMore(newGroups.length === GROUPS_PER_PAGE);
        } else {
          setError(data.error || 'Failed to fetch groups');
        }
      } catch (err) {
        console.error('Error fetching groups:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch groups');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [orderBy]
  );

  useEffect(() => {
    setOffset(0);
    fetchGroups(0, false, orderBy);
  }, [orderBy, fetchGroups]);

  const handleLoadMore = () => {
    const newOffset = offset + GROUPS_PER_PAGE;
    setOffset(newOffset);
    fetchGroups(newOffset, true);
  };

  const handleOrderChange = (newOrder: 'created_at' | 'member_count') => {
    setOrderBy(newOrder);
    setOffset(0);
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.loaderContainer}>
            <Loader size="large" message={t('groups.loadingGroups')} />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <h1>{t('common.error')}</h1>
            <p>{error}</p>
            <Link href="/" className={styles.backButton}>
              ← {t('posts.backToHome')}
            </Link>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroIcon}>👥</div>
          <h1 className={styles.heroTitle}>{t('groups.publicPageTitle')}</h1>
          <p className={styles.heroSubtitle}>{t('groups.publicPageSubtitle')}</p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statIcon}>🚴</span>
              <span className={styles.statText}>{t('groups.activeGroups')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>🤝</span>
              <span className={styles.statText}>{t('groups.friendlyRiders')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>📍</span>
              <span className={styles.statText}>{t('groups.localMeetups')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('groups.discoverGroupsTitle')}</h2>
          <p className={styles.sectionSubtitle}>{t('groups.perfectCommunity')}</p>
        </div>
        <div className={styles.filters}>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterButton} ${orderBy === 'member_count' ? styles.active : ''}`}
              onClick={() => handleOrderChange('member_count')}
            >
              🔥 {t('groups.mostPopular')}
            </button>
            <button
              className={`${styles.filterButton} ${orderBy === 'created_at' ? styles.active : ''}`}
              onClick={() => handleOrderChange('created_at')}
            >
              ✨ {t('groups.mostRecent')}
            </button>
          </div>
        </div>{' '}
        {groups.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🚲</div>
            <h2>{t('groups.noGroupsYet')}</h2>
            <p>{t('groups.beFirstToCreate')}</p>
            <Link href="/register" className={styles.ctaButton}>
              {t('posts.joinCommunity')}
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.groupsGrid}>
              {groups.map((group) => (
                <PublicGroupCard key={group.id} group={group} />
              ))}
            </div>

            {hasMore && (
              <div className={styles.loadMoreContainer}>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className={styles.loadMoreButton}
                >
                  {loadingMore ? (
                    <>
                      <Loader size="small" />
                      <span>{t('common.loading')}</span>
                    </>
                  ) : (
                    t('groups.loadMoreGroups')
                  )}
                </button>
              </div>
            )}

            {!hasMore && groups.length > 0 && (
              <div className={styles.endMessage}>
                <p>{t('groups.seenAllGroups')}</p>
              </div>
            )}
          </>
        )}
        {/* Community CTA Section */}
        <div className={styles.communityCta}>
          <div className={styles.ctaContent}>
            <h3>{t('groups.readyToRide')}</h3>
            <p>{t('groups.createOrJoin')}</p>
            <Link href="/register" className={styles.ctaButtonLarge}>
              {t('home.getStartedFree')}
            </Link>
          </div>
        </div>
        <div className={styles.actions}>
          <Link href="/" className={styles.backButton}>
            ← {t('posts.backToHome')}
          </Link>
        </div>
      </div>
    </main>
  );
}
