'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from '../../hooks/useTranslations';
import { PublicPostCard } from '../../components/PublicPostCard';
import { Loader } from '../../components/Loader';
import type { PostWithDetails } from '@cyclists/config';
import styles from './public-posts.module.css';

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
          setPosts(prev => [...prev, ...newPosts]);
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
            <Loader size="large" message="Loading posts..." />
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
          <h1 className={styles.title}>Latest Posts</h1>
          <p className={styles.subtitle}>
            Discover the latest stories and adventures from the cycling community
          </p>
        </div>

        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No posts yet</h2>
            <p>Be the first to share your cycling adventure!</p>
            <Link href="/register" className={styles.ctaButton}>
              Join the Community
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
                      <span>Loading...</span>
                    </>
                  ) : (
                    'Load More Posts'
                  )}
                </button>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className={styles.endMessage}>
                <p>You&apos;ve reached the end! ✨</p>
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
