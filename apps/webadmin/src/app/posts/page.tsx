'use client';

import { useEffect, useState, useCallback } from 'react';
import type { PostWithDetails } from '@bicicita/config';
import styles from '../../styles/common.module.css';
import { PostList } from '../../components/PostList';

export default function PostsManagement() {
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'public' | 'friends'>('all');

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const visibilityParam = filter !== 'all' ? `?visibility=${filter}` : '';
      const response = await fetch(`/api/webadmin/posts${visibilityParam}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDeletePost = async (postId: string): Promise<void> => {
    const response = await fetch(`/api/webadmin/posts/${postId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (data.success) {
      await fetchPosts();
    } else {
      throw new Error(data.error || 'Failed to delete post');
    }
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Posts Management</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'public' | 'friends')}
              className={styles.select}
            >
              <option value="all">All Posts</option>
              <option value="public">Public Posts</option>
              <option value="friends">Friends Posts</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {error && (
          <div className={styles.card}>
            <p className={styles.error}>{error}</p>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Loading posts...</div>
        ) : (
          <PostList posts={posts} onDelete={handleDeletePost} />
        )}
      </div>
    </>
  );
}
