'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from '../../hooks/useTranslations';
import { PublicGroupCard } from '../../components/PublicGroupCard';
import { Loader } from '../../components/Loader';
import type { GroupWithMemberCount } from '@cyclists/config';
import styles from './public-groups.module.css';

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

  const fetchGroups = useCallback(async (currentOffset: number, append: boolean = false, currentOrderBy: string = orderBy) => {
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
          setGroups(prev => [...prev, ...newGroups]);
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
  }, [orderBy]);

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
            <Loader size="large" message="Loading groups..." />
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
            <h1>Error</h1>
            <p>{error}</p>
            <Link href="/" className={styles.backButton}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Cycling Groups</h1>
          <p className={styles.subtitle}>
            Join a community of cyclists and connect with riders near you
          </p>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterButton} ${orderBy === 'member_count' ? styles.active : ''}`}
              onClick={() => handleOrderChange('member_count')}
            >
              Most Popular
            </button>
            <button
              className={`${styles.filterButton} ${orderBy === 'created_at' ? styles.active : ''}`}
              onClick={() => handleOrderChange('created_at')}
            >
              Most Recent
            </button>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No groups yet</h2>
            <p>Be the first to create a cycling group!</p>
            <Link href="/register" className={styles.ctaButton}>
              Join the Community
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
                      <span>Loading...</span>
                    </>
                  ) : (
                    'Load More Groups'
                  )}
                </button>
              </div>
            )}

            {!hasMore && groups.length > 0 && (
              <div className={styles.endMessage}>
                <p>You&apos;ve seen all groups! ✨</p>
              </div>
            )}
          </>
        )}

        <div className={styles.actions}>
          <Link href="/" className={styles.backButton}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
