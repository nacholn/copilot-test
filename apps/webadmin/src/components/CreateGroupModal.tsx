import { useState } from 'react';
import type { GroupType, CreateGroupInput } from '@cyclists/config';
import styles from '../styles/common.module.css';
import { GroupTypeSelector } from './GroupTypeSelector';
import { LocationPicker } from './LocationPicker';
import { ImageUpload } from './ImageUpload';

interface CreateGroupModalProps {
  onClose: () => void;
  onCreate: (groupData: CreateGroupInput) => Promise<{ success: boolean; error?: string }>;
}

export function CreateGroupModal({ onClose, onCreate }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GroupType>('general');
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [mainImagePublicId, setMainImagePublicId] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Group name is required');
      return;
    }

    if (type === 'location' && !city.trim()) {
      setError('Location-based groups must have a city');
      return;
    }

    setSubmitting(true);
    const groupData: CreateGroupInput = {
      name,
      description: description || undefined,
      type,
      mainImage: mainImage || undefined,
      mainImagePublicId: mainImagePublicId || undefined,
      city: type === 'location' ? city : undefined,
      latitude: type === 'location' ? latitude : undefined,
      longitude: type === 'location' ? longitude : undefined,
    };

    const result = await onCreate(groupData);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Failed to create group');
    }
  };

  const handleLocationChange = (newCity: string, lat?: number, lon?: number) => {
    setCity(newCity);
    setLatitude(lat);
    setLongitude(lon);
  };

  const handleImageChange = (imageUrl: string | null, publicId?: string) => {
    setMainImage(imageUrl);
    setMainImagePublicId(publicId || null);
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Create New Group</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="name">
              Group Name *
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              disabled={submitting}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description (optional)"
              disabled={submitting}
            />
          </div>

          <GroupTypeSelector value={type} onChange={setType} />

          {type === 'location' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Location *</label>
              <LocationPicker
                value={city}
                latitude={latitude}
                longitude={longitude}
                onChange={handleLocationChange}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Main Image</label>
            <ImageUpload
              currentImage={mainImage}
              folder="cyclists/groups"
              onImageChange={handleImageChange}
              size="medium"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.modalActions}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.buttonPrimary}`}
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
