'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from '../../hooks/useTranslations';
import { PublicPostCard } from '../../components/cards/PublicPostCard';
import { Loader } from '../../components/ui/Loader';
import type { PostWithDetails } from '@cyclists/config';
import styles from './posts.module.css';

const POSTS_PER_PAGE = 12;

export default function PublicPosts() {
  const { t } = useTranslations();
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const fetchPosts = useCallback(async (currentOffset: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(
        `${apiUrl}/api/posts/public?limit=${POSTS_PER_PAGE}&offset=${currentOffset}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();

      if (data.success) {
        const newPosts = data.data;

        if (append) {
          setPosts((prev) => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }

        // If we received fewer posts than requested, we've reached the end
        setHasMore(newPosts.length === POSTS_PER_PAGE);
      } else {
        setError(data.error || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(0, false);
  }, [fetchPosts]);

  const handleLoadMore = () => {
    const newOffset = offset + POSTS_PER_PAGE;
    setOffset(newOffset);
    fetchPosts(newOffset, true);
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.loaderContainer}>
            <Loader size="large" message={t('posts.loadingPosts')} />
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
          <div className={styles.heroIcon}>📝</div>
          <h1 className={styles.heroTitle}>{t('posts.publicPageTitle')}</h1>
          <p className={styles.heroSubtitle}>{t('posts.publicPageSubtitle')}</p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statIcon}>🚴</span>
              <span className={styles.statText}>{t('posts.activeCommunity')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>🌍</span>
              <span className={styles.statText}>{t('posts.ridersWorldwide')}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>📍</span>
              <span className={styles.statText}>{t('posts.localConnections')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('posts.latestPosts')}</h2>
          <p className={styles.sectionSubtitle}>{t('posts.freshStories')}</p>
        </div>

        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🚲</div>
            <h2>{t('posts.noPostsYet')}</h2>
            <p>{t('posts.beFirstToShare')}</p>
            <Link href="/register" className={styles.ctaButton}>
              {t('posts.joinCommunity')}
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.postsGrid}>
              {posts.map((post) => (
                <PublicPostCard key={post.id} post={post} />
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
                    t('posts.loadMorePosts')
                  )}
                </button>
              </div>
            )}{' '}
            {!hasMore && posts.length > 0 && (
              <div className={styles.endMessage}>
                <p>{t('posts.reachedEnd')}</p>
              </div>
            )}
          </>
        )}

        {/* Community CTA Section */}
        <div className={styles.communityCta}>
          <div className={styles.ctaContent}>
            <h3>{t('posts.readyToShare')}</h3>
            <p>{t('posts.joinThousands')}</p>
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
