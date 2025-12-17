'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import type { PostWithDetails, PostImage } from '@bicicita/config';
import styles from '../../../../styles/common.module.css';

interface PostUpdateInput {
  title?: string;
  content?: string;
  visibility?: 'public' | 'friends';
  slug?: string;
  metaDescription?: string | null;
  keywords?: string | null;
  publicationDate?: string | null;
}

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;

  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');
  const [slug, setSlug] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [publicationDate, setPublicationDate] = useState('');

  // Image management state
  const [images, setImages] = useState<PostImage[]>([]);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);

  // Generate slug from title
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Auto-generate slug if it's currently empty or matches the auto-generated version from original
    if (!slug || (post && slug === generateSlug(post.title))) {
      setSlug(generateSlug(newTitle));
    }
  };
  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/webadmin/posts/${postId}`);
        const data = await response.json();
        if (data.success && data.data) {
          const postData = data.data as PostWithDetails;
          setPost(postData);
          setTitle(postData.title);
          setContent(postData.content);
          setVisibility(postData.visibility as 'public' | 'friends');
          setSlug(postData.slug || '');
          setMetaDescription(postData.metaDescription || '');
          setKeywords(postData.keywords || '');
          setPublicationDate(
            postData.publicationDate
              ? new Date(postData.publicationDate).toISOString().split('T')[0]
              : ''
          );
          setImages(postData.images || []);
        } else {
          setError(data.error || 'Failed to fetch post');
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Handle image deletion
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    setDeletingImageId(imageId);
    setError(null);

    try {
      const response = await fetch(`/api/webadmin/posts/${postId}/images?imageId=${imageId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setImages(images.filter((img) => img.id !== imageId));
        setSuccessMessage('Image deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || 'Failed to delete image');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
    } finally {
      setDeletingImageId(null);
    }
  };

  // Handle image reordering
  const handleMoveImage = async (imageId: string, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex((img) => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    // Create new order
    const newImages = [...images];
    [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];

    // Update display orders
    const imageOrders = newImages.map((img, index) => ({
      id: img.id,
      displayOrder: index,
    }));

    try {
      const response = await fetch(`/api/webadmin/posts/${postId}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageOrders }),
      });

      const data = await response.json();

      if (data.success) {
        setImages(data.data);
      } else {
        setError(data.error || 'Failed to reorder images');
      }
    } catch (err) {
      console.error('Error reordering images:', err);
      setError('Failed to reorder images');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    const updates: PostUpdateInput = {};

    if (title !== post.title) {
      updates.title = title;
    }

    if (content !== post.content) {
      updates.content = content;
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

    const currentDate = post.publicationDate
      ? new Date(post.publicationDate).toISOString().split('T')[0]
      : '';
    if (publicationDate !== currentDate) {
      updates.publicationDate = publicationDate ? new Date(publicationDate).toISOString() : null;
    }

    if (Object.keys(updates).length === 0) {
      setError('No changes to save');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/webadmin/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (data.success) {
        setSuccessMessage('Post updated successfully!');
        // Update local post state with new values
        setPost({
          ...post,
          title,
          content,
          visibility,
          slug,
          metaDescription,
          keywords,
          publicationDate: publicationDate ? new Date(publicationDate) : undefined,
        } as PostWithDetails);
        // Redirect after short delay
        setTimeout(() => {
          router.push('/posts');
        }, 1500);
      } else {
        setError(data.error || 'Failed to update post');
      }
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.error}>{error || 'Post not found'}</p>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={() => router.push('/posts')}
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Edit Post</h1>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={() => router.push('/posts')}
          >
            ← Back to Posts
          </button>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.card}>
          {' '}
          {error && <div className={styles.error}>{error}</div>}
          {successMessage && <div className={styles.success}>{successMessage}</div>}
          <form onSubmit={handleSubmit}>
            {/* Post info */}
            <div
              style={{
                background: '#f8f9fa',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '12px',
                color: '#6c757d',
              }}
            >
              <strong>Author:</strong> {post.authorName} |
              <strong style={{ marginLeft: '8px' }}>ID:</strong> {post.id} |
              <strong style={{ marginLeft: '8px' }}>User ID:</strong> {post.userId}
            </div>
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
                Content
                <span className={styles.labelHint}>The main post content</span>
              </label>
              <textarea
                className={styles.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter post content..."
                rows={10}
                style={{ minHeight: '200px' }}
                required
              />
              <small className={styles.charCount}>{content.length} characters</small>
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
            <hr style={{ margin: '24px 0', borderColor: '#e2e8f0' }} />
            <h3 style={{ marginBottom: '16px', color: '#4a5568' }}>SEO & Publication Settings</h3>
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
            </div>{' '}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Publication Date
                <span className={styles.labelHint}>
                  {visibility === 'public'
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
            <hr style={{ margin: '24px 0', borderColor: '#e2e8f0' }} />
            <h3 style={{ marginBottom: '16px', color: '#4a5568' }}>Post Images</h3>
            {images.length === 0 ? (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  color: '#6c757d',
                }}
              >
                No images attached to this post
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '16px',
                }}
              >
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    style={{
                      position: 'relative',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#fff',
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '150px',
                      }}
                    >
                      <Image
                        src={image.imageUrl}
                        alt={`Image ${index + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="200px"
                      />
                    </div>
                    <div style={{ padding: '12px' }}>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#6c757d',
                          marginBottom: '8px',
                        }}
                      >
                        Order: {image.displayOrder + 1} of {images.length}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '6px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <button
                          type="button"
                          className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSmall}`}
                          onClick={() => handleMoveImage(image.id, 'up')}
                          disabled={index === 0}
                          style={{ opacity: index === 0 ? 0.5 : 1 }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSmall}`}
                          onClick={() => handleMoveImage(image.id, 'down')}
                          disabled={index === images.length - 1}
                          style={{ opacity: index === images.length - 1 ? 0.5 : 1 }}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`}
                          onClick={() => handleDeleteImage(image.id)}
                          disabled={deletingImageId === image.id}
                        >
                          {deletingImageId === image.id ? '...' : '🗑️'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.formActions}>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={() => router.push('/posts')}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
