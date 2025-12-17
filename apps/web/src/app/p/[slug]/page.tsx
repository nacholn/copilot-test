'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslations } from '../../../hooks/useTranslations';
import { generatePostStructuredData } from '../../../utils/structuredData';
import type { PostWithDetails } from '@bicicita/config';
import styles from './postDetail.module.css';

export default function PublicPostDetail({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslations();
  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/posts/slug/${params.slug}`);

        if (!response.ok) {
          throw new Error('Post not found');
        }

        const data = await response.json();
        if (data.success) {
          setPost(data.data);
        } else {
          setError(data.error || 'Failed to load post');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Post not found');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [params.slug]);

  const handleReply = () => {
    if (!user) {
      router.push(`/login?redirect=/p/${params.slug}`);
    } else {
      router.push(`/posts/${post?.id}`);
    }
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>{t('common.loading')}</div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className={styles.main}>
        <div className={styles.error}>
          <h1>Post Not Found</h1>
          <p>{error || 'The post you are looking for does not exist.'}</p>
          <Link href="/" className={styles.backLink}>
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const structuredData = generatePostStructuredData(post);

  return (
    <>
      <Head>
        <title>{post.title} | Cyclists Social Network</title>
        <meta name="description" content={post.metaDescription || post.content.substring(0, 160)} />
        {post.keywords && <meta name="keywords" content={post.keywords} />}
        <meta property="og:title" content={post.title} />
        <meta
          property="og:description"
          content={post.metaDescription || post.content.substring(0, 160)}
        />
        <meta property="og:type" content="article" />
        {post.images && post.images.length > 0 && (
          <meta property="og:image" content={post.images[0].imageUrl} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta
          name="twitter:description"
          content={post.metaDescription || post.content.substring(0, 160)}
        />
        {post.images && post.images.length > 0 && (
          <meta name="twitter:image" content={post.images[0].imageUrl} />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <main className={styles.main}>
        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.title}>{post.title}</h1>
            <div className={styles.meta}>
              {' '}
              <div className={styles.author}>
                {post.authorAvatar && (
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className={styles.authorAvatar}
                  />
                )}
                <span className={styles.authorName}>{post.authorName}</span>
              </div>
              <time className={styles.date}>
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </header>{' '}
          {post.images && post.images.length > 0 && (
            <div className={styles.images}>
              {post.images.map((image) => (
                <img
                  key={image.id}
                  src={image.imageUrl}
                  alt={post.title}
                  className={styles.image}
                />
              ))}
            </div>
          )}
          <div className={styles.content}>
            <p className={styles.text}>{post.content}</p>
          </div>
          <div className={styles.actions}>
            <div className={styles.stats}>
              <span className={styles.replyCount}>
                💬 {post.replyCount} {post.replyCount === 1 ? 'Reply' : 'Replies'}
              </span>
            </div>
            <button onClick={handleReply} className={styles.replyButton}>
              {user ? 'Reply to this post' : 'Login to reply'}
            </button>
          </div>
          {!user && (
            <div className={styles.loginPrompt}>
              <p>Want to join the conversation?</p>
              <div className={styles.loginActions}>
                <Link href={`/login?redirect=/p/${params.slug}`} className={styles.loginButton}>
                  Sign In
                </Link>
                <Link href="/register" className={styles.registerButton}>
                  Create Account
                </Link>
              </div>
            </div>
          )}
        </article>
      </main>
    </>
  );
}
