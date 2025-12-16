'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslations } from '../../../hooks/useTranslations';
import { AuthGuard } from '../../../components/AuthGuard';
import { Loader } from '../../../components/Loader';
import Swal from 'sweetalert2';
import styles from './create.module.css';

export default function CreatePost() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + images.length > 5) {
      Swal.fire({
        title: t('common.error'),
        text: t('posts.maxImages'),
        icon: 'error',
        confirmButtonColor: '#FE3C72',
      });
      return;
    }

    // Check file sizes
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          title: t('common.error'),
          text: t('imageUpload.fileSizeError'),
          icon: 'error',
          confirmButtonColor: '#FE3C72',
        });
        return;
      }
    }

    setImages([...images, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !title.trim() || !content.trim()) {
      Swal.fire({
        title: t('common.error'),
        text: t('posts.createPostFailed'),
        icon: 'error',
        confirmButtonColor: '#FE3C72',
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('visibility', visibility);

      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          title: t('posts.postCreated'),
          text: t('posts.postCreatedSuccess'),
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
        router.push('/my-posts');
      } else {
        throw new Error(data.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Swal.fire({
        title: t('common.error'),
        text: t('posts.createPostFailed'),
        icon: 'error',
        confirmButtonColor: '#FE3C72',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <Link href="/my-posts" className={styles.backButton}>
              ← {t('posts.backToPosts')}
            </Link>
            <h1 className={styles.title}>{t('posts.createPost')}</h1>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>
                {t('posts.postTitle')} *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.input}
                placeholder={t('posts.postTitle')}
                required
                maxLength={500}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="content" className={styles.label}>
                {t('posts.postContent')} *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={styles.textarea}
                placeholder={t('posts.postContent')}
                required
                rows={8}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="visibility" className={styles.label}>
                {t('posts.visibility')} *
              </label>
              <select
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'public' | 'friends')}
                className={styles.select}
              >
                <option value="public">{t('posts.public')}</option>
                <option value="friends">{t('posts.friends')}</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('posts.selectImages')}</label>
              <div className={styles.imageUploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className={styles.fileInput}
                  id="images"
                  disabled={images.length >= 5}
                />
                <label htmlFor="images" className={styles.fileLabel}>
                  <span className={styles.uploadIcon}>📷</span>
                  <span>{t('imageUpload.clickToUpload')}</span>
                  <span className={styles.uploadHint}>{t('posts.maxImages')}</span>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className={styles.imagePreviews}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className={styles.imagePreview}>
                      <Image src={preview} alt={`Preview ${index + 1}`} fill style={{ objectFit: 'cover' }} sizes="200px" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className={styles.removeImageButton}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>{' '}
            <div className={styles.formActions}>
              <Link href="/my-posts" className={styles.cancelButton}>
                {t('common.cancel')}
              </Link>
              <button
                type="submit"
                disabled={loading || !title.trim() || !content.trim()}
                className={styles.submitButton}
              >
                {loading ? t('posts.creatingPost') : t('posts.createPostButton')}
              </button>
            </div>
          </form>

          {loading && (
            <div className={styles.loadingOverlay}>
              <Loader />
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
