'use client';

import { useState } from 'react';
import type { PostWithDetails } from '@cyclists/config';
import styles from '../styles/common.module.css';

interface EditPostModalProps {
  post: PostWithDetails;
  onClose: () => void;
  onUpdate: (postId: string, updates: any) => Promise<{ success: boolean; error?: string }>;
}

export function EditPostModal({ post, onClose, onUpdate }: EditPostModalProps) {
  const [metaDescription, setMetaDescription] = useState(post.metaDescription || '');
  const [keywords, setKeywords] = useState(post.keywords || '');
  const [publicationDate, setPublicationDate] = useState(
    post.publicationDate ? new Date(post.publicationDate).toISOString().split('T')[0] : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const updates: any = {};

    if (metaDescription !== (post.metaDescription || '')) {
      updates.metaDescription = metaDescription || null;
    }

    if (keywords !== (post.keywords || '')) {
      updates.keywords = keywords || null;
    }

    // Only include publicationDate if it's different
    const currentDate = post.publicationDate ? new Date(post.publicationDate).toISOString().split('T')[0] : '';
    if (publicationDate !== currentDate) {
      updates.publicationDate = publicationDate ? new Date(publicationDate).toISOString() : null;
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
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Post SEO & Publication Date</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.infoBox}>
              <h4>Post Information</h4>
              <p><strong>Title:</strong> {post.title}</p>
              <p><strong>Visibility:</strong> {post.visibility}</p>
              <p><strong>Slug:</strong> {post.slug}</p>
            </div>

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
