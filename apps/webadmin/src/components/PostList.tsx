'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { PostWithDetails } from '@cyclists/config';
import styles from '../styles/common.module.css';
import { DeleteButton } from './DeleteButton';

interface PostListProps {
  posts: PostWithDetails[];
  onDelete?: (postId: string) => Promise<void>;
}

export function PostList({ posts, onDelete }: PostListProps) {
  const router = useRouter();

  if (posts.length === 0) {
    return (
      <div className={styles.card}>
        <p>No posts found</p>
      </div>
    );
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.grid}>
      {posts.map((post) => (
        <div key={post.id} className={styles.card}>
          {/* Header with title and visibility badge */}
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>{post.title}</h3>
            <span
              className={`${styles.badge} ${post.visibility === 'public' ? styles.badgeSuccess : styles.badgeInfo}`}
            >
              {post.visibility}
            </span>
          </div>

          {/* Images preview */}
          {post.images && post.images.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                }}
              >
                {post.images.map((image, index) => (
                  <div
                    key={image.id || index}
                    style={{
                      position: 'relative',
                      width: '80px',
                      height: '80px',
                      flexShrink: 0,
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={`Post image ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
              <small style={{ color: '#6c757d', fontSize: '12px' }}>
                {post.images.length} image{post.images.length !== 1 ? 's' : ''}
              </small>
            </div>
          )}

          <div className={styles.cardBody}>
            {/* Content preview */}
            <p className={styles.cardText}>
              {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
            </p>

            {/* Post metadata */}
            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <strong>ID:</strong>{' '}
                <code
                  style={{
                    fontSize: '11px',
                    background: '#f1f1f1',
                    padding: '2px 4px',
                    borderRadius: '3px',
                  }}
                >
                  {post.id}
                </code>
              </div>
              <div className={styles.metaItem}>
                <strong>Author:</strong> {post.authorName}
                {post.authorAvatar && (
                  <span style={{ marginLeft: '8px' }}>
                    <Image
                      src={post.authorAvatar}
                      alt={post.authorName}
                      width={20}
                      height={20}
                      style={{ borderRadius: '50%', verticalAlign: 'middle' }}
                    />
                  </span>
                )}
              </div>
              <div className={styles.metaItem}>
                <strong>User ID:</strong>{' '}
                <code
                  style={{
                    fontSize: '11px',
                    background: '#f1f1f1',
                    padding: '2px 4px',
                    borderRadius: '3px',
                  }}
                >
                  {post.userId}
                </code>
              </div>
              <div className={styles.metaItem}>
                <strong>Slug:</strong>{' '}
                {post.slug ? (
                  <code
                    style={{
                      fontSize: '11px',
                      background: '#e8f5e9',
                      padding: '2px 4px',
                      borderRadius: '3px',
                    }}
                  >
                    /posts/{post.slug}
                  </code>
                ) : (
                  <em>Not set</em>
                )}
              </div>
              <div className={styles.metaItem}>
                <strong>Replies:</strong> {post.replyCount}
              </div>
            </div>

            {/* Dates */}
            <div className={styles.metaInfo} style={{ marginTop: '10px' }}>
              <div className={styles.metaItem}>
                <strong>Created:</strong> {formatDate(post.createdAt)}
              </div>
              <div className={styles.metaItem}>
                <strong>Updated:</strong> {formatDate(post.updatedAt)}
              </div>
              {post.publicationDate && (
                <div className={styles.metaItem}>
                  <strong>Published:</strong> {formatDate(post.publicationDate)}
                </div>
              )}
            </div>

            {/* SEO Info */}
            <div className={styles.seoInfo}>
              <div
                style={{
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: '#495057',
                }}
              >
                SEO Settings
              </div>
              <div className={styles.metaItem}>
                <strong>Meta Description:</strong>{' '}
                {post.metaDescription ? (
                  <span style={{ color: '#28a745' }}>
                    {post.metaDescription.length > 80
                      ? `${post.metaDescription.substring(0, 80)}...`
                      : post.metaDescription}
                  </span>
                ) : (
                  <em>Not set</em>
                )}
              </div>
              <div className={styles.metaItem}>
                <strong>Keywords:</strong>{' '}
                {post.keywords ? (
                  <span>
                    {post.keywords
                      .split(',')
                      .slice(0, 3)
                      .map((kw, i) => (
                        <span
                          key={i}
                          style={{
                            background: '#e3f2fd',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            marginRight: '4px',
                          }}
                        >
                          {kw.trim()}
                        </span>
                      ))}
                    {post.keywords.split(',').length > 3 && (
                      <span style={{ color: '#6c757d', fontSize: '11px' }}>
                        +{post.keywords.split(',').length - 3} more
                      </span>
                    )}
                  </span>
                ) : (
                  <em>Not set</em>
                )}
              </div>
            </div>
          </div>

          <div className={styles.cardFooter}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={() => router.push(`/posts/${post.id}/edit`)}
              >
                Edit Post
              </button>
              {onDelete && (
                <DeleteButton
                  onDelete={() => onDelete(post.id)}
                  itemName="post"
                  confirmMessage="Are you sure you want to delete this post? This will also delete all post images from Cloudinary."
                >
                  Delete Post
                </DeleteButton>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
