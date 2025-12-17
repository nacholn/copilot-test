'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProfileImage } from '@bicicita/config';
import { useTranslations } from '../../hooks/useTranslations';
import { Loader } from '../ui/Loader';
import styles from './profile-image-gallery.module.css';

interface ProfileImageGalleryProps {
  userId: string;
  editable?: boolean;
  onImageUpdate?: () => void;
}

export function ProfileImageGallery({
  userId,
  editable = false,
  onImageUpdate,
}: ProfileImageGalleryProps) {
  const { t } = useTranslations();
  const [images, setImages] = useState<ProfileImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ProfileImage | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch(`/api/profile/images?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setImages(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchImages();
  }, [userId, fetchImages]);

  const handleFileSelect = async (file: File, isPrimary: boolean = false) => {
    if (!file.type.startsWith('image/')) {
      alert(t('imageUpload.fileTypeError'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(t('imageUpload.fileSizeError'));
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('isPrimary', isPrimary.toString());
      formData.append('file', file);

      const response = await fetch('/api/profile/images', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        await fetchImages();
        if (onImageUpdate) onImageUpdate();
      } else {
        alert(data.error || t('imageUpload.uploadFailed'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(t('imageUpload.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/profile/images?imageId=${imageId}&userId=${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchImages();
        if (onImageUpdate) onImageUpdate();
      } else {
        alert(data.error || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const response = await fetch(`/api/profile/images?imageId=${imageId}&userId=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrimary: true }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchImages();
        if (onImageUpdate) onImageUpdate();
      } else {
        alert(data.error || 'Failed to set primary image');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to set primary image');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size="medium" message={t('common.loading')} />
      </div>
    );
  }

  const primaryImage = images.find((img) => img.isPrimary);
  const secondaryImages = images.filter((img) => !img.isPrimary);

  return (
    <div className={styles.gallery}>
      {/* Primary Image Section */}
      <div className={styles.primarySection}>
        <h3 className={styles.sectionTitle}>{t('profile.primaryImage')}</h3>
        {primaryImage ? (
          <div className={styles.primaryImageContainer}>
            <div className={styles.imageWrapper}>
              <img
                src={primaryImage.imageUrl}
                alt="Primary profile image"
                className={styles.image}
              />
              {editable && (
                <div className={styles.imageOverlay}>
                  <button
                    onClick={() => handleDeleteImage(primaryImage.id)}
                    className={styles.deleteButton}
                    title={t('common.delete')}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
            <span className={styles.primaryBadge}>{t('common.primary')}</span>
          </div>
        ) : (
          editable && (
            <div className={styles.uploadZone}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file, true);
                }}
                className={styles.fileInput}
                id="primary-upload"
                disabled={uploading}
              />
              <label htmlFor="primary-upload" className={styles.uploadLabel}>
                {uploading ? t('imageUpload.uploading') : t('profile.addImage')}
              </label>
            </div>
          )
        )}
      </div>

      {/* Secondary Images Section */}
      <div className={styles.secondarySection}>
        <h3 className={styles.sectionTitle}>{t('profile.secondaryImages')}</h3>
        <div className={styles.secondaryGrid}>
          {secondaryImages.map((img) => (
            <div key={img.id} className={styles.secondaryImageContainer}>
              <div className={styles.imageWrapper}>
                <img
                  src={img.imageUrl}
                  alt="Profile image"
                  className={styles.image}
                  onClick={() => setSelectedImage(img)}
                />
                {editable && (
                  <div className={styles.imageOverlay}>
                    <button
                      onClick={() => handleSetPrimary(img.id)}
                      className={styles.setPrimaryButton}
                      title="Set as primary"
                    >
                      ⭐
                    </button>
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className={styles.deleteButton}
                      title={t('common.delete')}
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {editable && (
            <div className={styles.uploadZone}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file, false);
                }}
                className={styles.fileInput}
                id="secondary-upload"
                disabled={uploading}
              />
              <label htmlFor="secondary-upload" className={styles.uploadLabel}>
                {uploading ? t('imageUpload.uploading') : '+ ' + t('profile.addImage')}
              </label>
            </div>
          )}
        </div>

        {!editable && secondaryImages.length === 0 && (
          <p className={styles.noImages}>{t('profile.noSecondaryImages')}</p>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className={styles.modal} onClick={() => setSelectedImage(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedImage(null)}>
              ×
            </button>
            <img src={selectedImage.imageUrl} alt="Full size image" className={styles.modalImage} />
          </div>
        </div>
      )}
    </div>
  );
}
