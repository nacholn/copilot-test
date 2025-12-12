'use client';

import { useState } from 'react';
import type { PostWithDetails } from '@cyclists/config';
import styles from '../styles/common.module.css';

interface PostUpdateInput {
  title?: string;
  visibility?: 'public' | 'friends';
  slug?: string;
  metaDescription?: string | null;
  keywords?: string | null;
  publicationDate?: string | null;
}

interface EditPostModalProps {
  post: PostWithDetails;
  onClose: () => void;
  onUpdate: (
    postId: string,
    updates: PostUpdateInput
  ) => Promise<{ success: boolean; error?: string }>;
}

export function EditPostModal({ post, onClose, onUpdate }: EditPostModalProps) {
  const [title, setTitle] = useState(post.title);
  const [visibility, setVisibility] = useState<'public' | 'friends'>(
    post.visibility as 'public' | 'friends'
  );
  const [slug, setSlug] = useState(post.slug || '');
  const [metaDescription, setMetaDescription] = useState(post.metaDescription || '');
  const [keywords, setKeywords] = useState(post.keywords || '');
  const [publicationDate, setPublicationDate] = useState(
    post.publicationDate ? new Date(post.publicationDate).toISOString().split('T')[0] : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate slug from title
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Auto-generate slug if it's currently empty or matches the auto-generated version
    if (!slug || slug === generateSlug(post.title)) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const updates: PostUpdateInput = {};

    if (title !== post.title) {
      updates.title = title;
    }

    if (visibility !== post.visibility) {
      updates.visibility = visibility;
    }

    if (slug !== (post.slug || '')) {
      updates.slug = slug;
    }

    if (metaDescription !== (post.metaDescription || '')) {
      updates.metaDescription = metaDescription || null;
    }

    if (keywords !== (post.keywords || '')) {
      updates.keywords = keywords || null;
    }

    // Only include publicationDate if it's different
    const currentDate = post.publicationDate
      ? new Date(post.publicationDate).toISOString().split('T')[0]
      : '';
    if (publicationDate !== currentDate) {
      updates.publicationDate = publicationDate ? new Date(publicationDate).toISOString() : null;
    }

    // Check if there are any changes
    if (Object.keys(updates).length === 0) {
      setError('No changes to save');
      setLoading(false);
      return;
    }

    const result = await onUpdate(post.id, updates);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to update post');
    }

    setLoading(false);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {' '}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Post</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Title
                <span className={styles.labelHint}>The post title</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter post title..."
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Visibility
                <span className={styles.labelHint}>Who can see this post</span>
              </label>
              <select
                className={styles.input}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'public' | 'friends')}
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Slug
                <span className={styles.labelHint}>
                  URL-friendly identifier (lowercase, numbers, hyphens only)
                </span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="post-url-slug"
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                title="Slug must contain only lowercase letters, numbers, and hyphens"
              />
              <small className={styles.charCount}>Preview: /posts/{slug || 'post-slug'}</small>
            </div>

            <hr style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />

            <h4 style={{ marginBottom: '12px', color: '#4a5568' }}>SEO & Publication Settings</h4>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Meta Description (for SEO)
                <span className={styles.labelHint}>Max 500 characters, recommended 150-160</span>
              </label>
              <textarea
                className={styles.textarea}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Brief description of the post for search engines..."
              />
              <small className={styles.charCount}>{metaDescription.length}/500 characters</small>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Keywords (comma-separated)
                <span className={styles.labelHint}>Relevant keywords for SEO</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="cycling, adventure, tips, mountain biking"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Publication Date
                <span className={styles.labelHint}>
                  {post.visibility === 'public'
                    ? 'Required for public posts'
                    : 'Optional (auto-set for friends posts)'}
                </span>
              </label>
              <input
                type="date"
                className={styles.input}
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.buttonPrimary}`}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
