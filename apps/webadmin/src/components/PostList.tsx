'use client';

import type { PostWithDetails } from '@cyclists/config';
import styles from '../styles/common.module.css';

interface PostListProps {
  posts: PostWithDetails[];
  onEdit: (post: PostWithDetails) => void;
}

export function PostList({ posts, onEdit }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className={styles.card}>
        <p>No posts found</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {posts.map((post) => (
        <div key={post.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>{post.title}</h3>
            <span className={`${styles.badge} ${post.visibility === 'public' ? styles.badgeSuccess : styles.badgeInfo}`}>
              {post.visibility}
            </span>
          </div>
          
          <div className={styles.cardBody}>
            <p className={styles.cardText}>
              {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
            </p>
            
            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <strong>Author:</strong> {post.authorName}
              </div>
              <div className={styles.metaItem}>
                <strong>Slug:</strong> {post.slug || <em>Not generated yet</em>}
              </div>
              <div className={styles.metaItem}>
                <strong>Created:</strong> {new Date(post.createdAt).toLocaleDateString()}
              </div>
              {post.publicationDate && (
                <div className={styles.metaItem}>
                  <strong>Published:</strong> {new Date(post.publicationDate).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className={styles.seoInfo}>
              <div className={styles.metaItem}>
                <strong>SEO Description:</strong> {post.metaDescription || <em>Not set</em>}
              </div>
              <div className={styles.metaItem}>
                <strong>Keywords:</strong> {post.keywords || <em>Not set</em>}
              </div>
            </div>
          </div>
          
          <div className={styles.cardFooter}>
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={() => onEdit(post)}
            >
              Edit SEO & Publication Date
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
