'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { PostWithDetails } from '@cyclists/config';
import styles from './PublicPostCard.module.css';

interface PublicPostCardProps {
  post: PostWithDetails;
}

export function PublicPostCard({ post }: PublicPostCardProps) {
  const imageUrl = post.images && post.images.length > 0 ? post.images[0].imageUrl : null;
  
  // Use slug if available, otherwise fallback to ID-based URL
  const postUrl = post.slug ? `/p/${post.slug}` : `/posts/${post.id}`;

  return (
    <Link href={postUrl} className={styles.card}>
      {imageUrl && (
        <div className={styles.imageContainer}>
          <Image src={imageUrl} alt={post.title} fill className={styles.image} style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 400px" />
        </div>
      )}
      <div className={styles.content}>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.excerpt}>
          {post.content.length > 120
            ? `${post.content.substring(0, 120)}...`
            : post.content}
        </p>
        <div className={styles.meta}>
          <span className={styles.author}>
            {post.authorAvatar && (
              <Image
                src={post.authorAvatar}
                alt={post.authorName}
                width={24}
                height={24}
                className={styles.authorAvatar}
                style={{ objectFit: 'cover' }}
              />
            )}
            {post.authorName}
          </span>
          <span className={styles.date}>
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
        {post.replyCount > 0 && (
          <div className={styles.replies}>
            💬 {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
          </div>
        )}
      </div>
    </Link>
  );
}
