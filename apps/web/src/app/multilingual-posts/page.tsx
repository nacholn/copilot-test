'use client';

import { useState, useEffect } from 'react';
import { CreateMultilingualPostForm } from '@/components/forms/CreateMultilingualPostForm';
import { MultilingualPostCard } from '@/components/posts/MultilingualPostCard';
import type { MultilingualPost, SupportedLanguage } from '@cyclists/config';
import styles from './page.module.css';

export default function MultilingualPostsPage() {
  const [posts, setPosts] = useState<MultilingualPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [languageFilter, setLanguageFilter] = useState<SupportedLanguage | 'all'>('all');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [languageFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        languageFilter === 'all'
          ? '/api/multilingual-posts'
          : `/api/multilingual-posts?language=${languageFilter}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setPosts(result.data);
      } else {
        setError(result.error || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('An error occurred while fetching posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Multilingual Posts</h1>
        <p>Create and view posts in multiple languages</p>
      </header>

      <div className={styles.controls}>
        <button onClick={() => setShowForm(!showForm)} className={styles.toggleButton}>
          {showForm ? 'Hide Form' : 'Create New Post'}
        </button>

        <div className={styles.filterGroup}>
          <label htmlFor="language-filter">Filter by language:</label>
          <select
            id="language-filter"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value as SupportedLanguage | 'all')}
            className={styles.select}
          >
            <option value="all">All Languages</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>

      {showForm && (
        <div className={styles.formContainer}>
          <CreateMultilingualPostForm />
        </div>
      )}

      <div className={styles.postsContainer}>
        <h2>Posts</h2>

        {loading && <p>Loading posts...</p>}

        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && posts.length === 0 && (
          <p className={styles.emptyState}>No posts yet. Create your first multilingual post!</p>
        )}

        {!loading &&
          !error &&
          posts.map((post) => <MultilingualPostCard key={post.id} post={post} />)}
      </div>
    </div>
  );
}
