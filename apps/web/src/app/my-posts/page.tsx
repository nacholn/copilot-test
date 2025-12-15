'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { AuthGuard } from '../../components/AuthGuard';
import { Avatar } from '../../components/Avatar';
import { Loader } from '../../components/Loader';
import type { PostWithDetails } from '@cyclists/config';
import styles from './posts.module.css';

export default function Posts() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/posts?userId=${user.id}&showAll=${showAll}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [user, showAll]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, showAll, fetchPosts]);

  const toggleFilter = () => {
    setShowAll(!showAll);
  };

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>{t('posts.title')}</h1>
            <div className={styles.actions}>
              <button onClick={toggleFilter} className={styles.filterButton}>
                {showAll ? t('posts.showUnread') : t('posts.showAll')}
              </button>
              <Link href="/my-posts/create" className={styles.createButton}>
                {t('posts.createPost')}
              </Link>
            </div>
          </div>

          {loading ? (
            <div className={styles.loaderContainer}>
              <Loader />
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>
                {showAll ? t('posts.noPosts') : t('posts.noUnreadPosts')}
              </p>
              <Link href="/my-posts/create" className={styles.createButtonLarge}>
                {t('posts.startCreating')}
              </Link>
            </div>
          ) : (
            <div className={styles.postsList}>
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/my-posts/${post.id}`}
                  className={styles.postCard}
                >
                  {post.images.length > 0 && (
                    <div className={styles.postImage}>
                      <Image src={post.images[0].imageUrl} alt={post.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 300px" />
                      {post.images.length > 1 && (
                        <div className={styles.imageCount}>
                          +{post.images.length - 1} {post.images.length === 2 ? t('posts.image') : t('posts.images')}
                        </div>
                      )}
                    </div>
                  )}
                  <div className={styles.postContent}>
                    <div className={styles.postHeader}>
                      <div className={styles.authorInfo}>
                        <Avatar src={post.authorAvatar} name={post.authorName} size="small" />
                        <span className={styles.authorName}>{post.authorName}</span>
                      </div>
                      {post.hasNewActivity && (
                        <span className={styles.newBadge}>{t('posts.newBadge')}</span>
                      )}
                    </div>
                    <h2 className={styles.postTitle}>{post.title}</h2>
                    <p className={styles.postExcerpt}>
                      {post.content.length > 150
                        ? `${post.content.substring(0, 150)}...`
                        : post.content}
                    </p>
                    <div className={styles.postMeta}>
                      <span className={styles.visibility}>
                        {post.visibility === 'public' ? '🌍' : '👥'}{' '}
                        {post.visibility === 'public' ? t('posts.public') : t('posts.friends')}
                      </span>
                      <span className={styles.replyCount}>
                        💬 {post.replyCount} {post.replyCount === 1 ? t('posts.reply') : t('posts.replies')}
                      </span>
                      <span className={styles.postDate}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
