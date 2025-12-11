'use client';

import { useEffect, useState } from 'react';
import type { PostWithDetails } from '@cyclists/config';
import styles from '../../styles/common.module.css';
import { PostList } from '../../components/PostList';
import { EditPostModal } from '../../components/EditPostModal';

export default function PostsManagement() {
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'public' | 'friends'>('all');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const visibilityParam = filter !== 'all' ? `?visibility=${filter}` : '';
      const response = await fetch(`${apiUrl}/api/webadmin/posts${visibilityParam}`);
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
  };

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const handleEditPost = (post: PostWithDetails) => {
    setSelectedPost(post);
    setShowEditModal(true);
  };

  const handleUpdatePost = async (postId: string, updates: any) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/webadmin/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setShowEditModal(false);
        fetchPosts();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to update post' };
      }
    } catch (err) {
      console.error('Error updating post:', err);
      return { success: false, error: 'Failed to update post' };
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
              onChange={(e) => setFilter(e.target.value as any)}
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
          <PostList posts={posts} onEdit={handleEditPost} />
        )}
      </div>

      {showEditModal && selectedPost && (
        <EditPostModal
          post={selectedPost}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdatePost}
        />
      )}
    </>
  );
}
