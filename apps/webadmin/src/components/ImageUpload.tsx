'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './image-upload.module.css';

interface ImageUploadProps {
  currentImage?: string | null;
  folder?: string;
  onImageChange: (imageUrl: string | null, publicId?: string) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function ImageUpload({
  currentImage,
  folder = 'bicicita/uploads',
  onImageChange,
  className,
  size = 'medium',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });      const data = await response.json();

      if (data.success) {
        onImageChange(data.data.url, data.data.publicId);
      } else {
        console.error('Upload failed:', data.error);
        if (data.error?.includes('credentials') || data.error?.includes('API key')) {
          alert('Image upload is not configured yet. Please contact administrator.');
        } else {
          alert(data.error || 'Upload failed');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Could not connect to upload service. Please try again.');
      } else {
        alert('Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };
  const handleRemoveImage = async () => {
    try {
      // If there's a current image, try to extract the public ID and delete it
      if (currentImage && currentImage.includes('cloudinary.com')) {
        // Extract public ID from Cloudinary URL
        const urlParts = currentImage.split('/');
        const filenameWithExtension = urlParts[urlParts.length - 1];
        const publicId = filenameWithExtension.split('.')[0];
        const folder = urlParts.slice(-2, -1)[0]; // Get folder name
        const fullPublicId = folder ? `${folder}/${publicId}` : publicId;

        // Call delete API
        const response = await fetch(`/api/upload?publicId=${encodeURIComponent(fullPublicId)}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          console.warn('Failed to delete image from Cloudinary, but continuing with removal');
        }
      }
      
      onImageChange(null);
    } catch (error) {
      console.error('Error removing image:', error);
      // Still remove from UI even if deletion fails
      onImageChange(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`${styles.uploadContainer} ${styles[size]} ${className || ''}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className={styles.hiddenInput}
      />

      <div
        className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''} ${uploading ? styles.uploading : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        {uploading ? (
          <div className={styles.uploadingState}>
            <div className={styles.spinner}></div>
            <p>Uploading...</p>
          </div>
        ) : currentImage ? (
          <div className={styles.imagePreview}>
            <Image
              src={currentImage}
              alt="Uploaded image"
              fill
              className={styles.image}
              style={{ objectFit: 'cover' }}
            />
            <div className={styles.imageOverlay}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}
                className={styles.changeButton}
              >
                Change
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className={styles.removeButton}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.dropzoneContent}>
            <div className={styles.uploadIcon}>📸</div>
            <p className={styles.uploadText}>
              Click to upload or drag and drop an image
            </p>
            <p className={styles.uploadHint}>
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
