'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslations } from '../../../hooks/useTranslations';
import { AuthGuard } from '../../../components/AuthGuard';
import { Avatar } from '../../../components/Avatar';
import { Loader } from '../../../components/Loader';
import type { Post, PostImage, PostReplyWithAuthor } from '@cyclists/config';
import Swal from 'sweetalert2';
import styles from './post-detail.module.css';

interface PostDetails extends Post {
  authorName: string;
  authorAvatar?: string;
  images: PostImage[];
}

export default function PostDetail() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const params = useParams();
  const postId = params.postId as string;
  
  const [post, setPost] = useState<PostDetails | null>(null);
  const [replies, setReplies] = useState<PostReplyWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (user && postId) {
      fetchPost();
      fetchReplies();
      markAsViewed();
    }
  }, [user, postId]);

  const fetchPost = async () => {
    try {
      // For now, we'll need to get post details from the list endpoint
      // In a production app, you'd want a dedicated endpoint for single post
      const response = await fetch(`/api/posts?userId=${user!.id}&showAll=true`);
      const data = await response.json();

      if (data.success) {
        const foundPost = data.data.find((p: any) => p.id === postId);
        if (foundPost) {
          // Fetch all images for this post
          const imagesResponse = await fetch(`/api/posts/${postId}/images`);
          let images = foundPost.images || [];
          
          setPost({
            id: foundPost.id,
            userId: foundPost.userId,
            title: foundPost.title,
            content: foundPost.content,
            visibility: foundPost.visibility,
            createdAt: foundPost.createdAt,
            updatedAt: foundPost.updatedAt,
            authorName: foundPost.authorName,
            authorAvatar: foundPost.authorAvatar,
            images: images,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/replies`);
      const data = await response.json();

      if (data.success) {
        setReplies(data.data);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const markAsViewed = async () => {
    try {
      await fetch(`/api/posts/${postId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user!.id }),
      });
    } catch (error) {
      console.error('Error marking post as viewed:', error);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      return;
    }

    setSendingReply(true);

    try {
      const response = await fetch(`/api/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user!.id,
          content: replyContent.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setReplyContent('');
        await fetchReplies();
      } else {
        throw new Error(data.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      Swal.fire({
        title: t('common.error'),
        text: 'Failed to send reply',
        icon: 'error',
        confirmButtonColor: '#FE3C72',
      });
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <main className={styles.main}>
          <div className={styles.loaderContainer}>
            <Loader />
          </div>
        </main>
      </AuthGuard>
    );
  }

  if (!post) {
    return (
      <AuthGuard>
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.errorState}>
              <h2>Post not found</h2>
              <Link href="/posts" className={styles.backButton}>
                {t('posts.backToPosts')}
              </Link>
            </div>
          </div>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <Link href="/posts" className={styles.backLink}>
            ← {t('posts.backToPosts')}
          </Link>

          <article className={styles.postCard}>
            <div className={styles.postHeader}>
              <div className={styles.authorInfo}>
                <Avatar src={post.authorAvatar} name={post.authorName} size="large" />
                <div>
                  <h2 className={styles.authorName}>{post.authorName}</h2>
                  <p className={styles.postDate}>
                    {new Date(post.createdAt).toLocaleDateString()} •{' '}
                    {post.visibility === 'public' ? '🌍 ' + t('posts.public') : '👥 ' + t('posts.friends')}
                  </p>
                </div>
              </div>
            </div>

            <h1 className={styles.postTitle}>{post.title}</h1>

            {post.images && post.images.length > 0 && (
              <div className={styles.imagesSection}>
                <div className={styles.mainImage}>
                  <img
                    src={post.images[selectedImage]?.imageUrl}
                    alt={`${post.title} - Image ${selectedImage + 1}`}
                  />
                </div>
                {post.images.length > 1 && (
                  <div className={styles.imageThumbnails}>
                    {post.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(index)}
                        className={`${styles.thumbnail} ${
                          index === selectedImage ? styles.thumbnailActive : ''
                        }`}
                      >
                        <img src={image.imageUrl} alt={`Thumbnail ${index + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className={styles.postContent}>
              <p>{post.content}</p>
            </div>
          </article>

          <section className={styles.repliesSection}>
            <h3 className={styles.repliesTitle}>
              {replies.length} {replies.length === 1 ? t('posts.reply') : t('posts.replies')}
            </h3>

            <form onSubmit={handleSendReply} className={styles.replyForm}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={t('posts.replyPlaceholder')}
                className={styles.replyInput}
                rows={3}
              />
              <button
                type="submit"
                disabled={!replyContent.trim() || sendingReply}
                className={styles.replyButton}
              >
                {sendingReply ? t('common.loading') : t('posts.sendReply')}
              </button>
            </form>

            {replies.length === 0 ? (
              <div className={styles.noReplies}>
                <p>{t('posts.noReplies')}</p>
                <p className={styles.noRepliesHint}>{t('posts.beFirst')}</p>
              </div>
            ) : (
              <div className={styles.repliesList}>
                {replies.map((reply) => (
                  <div key={reply.id} className={styles.replyCard}>
                    <div className={styles.replyHeader}>
                      <Avatar src={reply.authorAvatar} name={reply.authorName} size="small" />
                      <div className={styles.replyMeta}>
                        <span className={styles.replyAuthor}>{reply.authorName}</span>
                        <span className={styles.replyDate}>
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className={styles.replyContent}>{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </AuthGuard>
  );
}
