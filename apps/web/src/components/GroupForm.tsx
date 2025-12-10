'use client';

import { useState } from 'react';
import { LocationPicker } from './LocationPicker';
import { ImageUpload } from './ImageUpload';
import { useTranslations } from '../hooks/useTranslations';
import type { CreateGroupInput, UpdateGroupInput, GroupType } from '@cyclists/config';
import styles from './group-form.module.css';

interface GroupFormProps {
  initialData?: {
    name: string;
    description?: string;
    type: GroupType;
    city?: string;
    latitude?: number;
    longitude?: number;
    mainImage?: string;
  };
  onSubmit: (data: CreateGroupInput | UpdateGroupInput) => Promise<void>;
  submitLabel: string;
  loading?: boolean;
}

export function GroupForm({ initialData, onSubmit, submitLabel, loading = false }: GroupFormProps) {
  const { t } = useTranslations();
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState<GroupType>(initialData?.type || 'general');
  const [city, setCity] = useState(initialData?.city || '');
  const [latitude, setLatitude] = useState<number | undefined>(initialData?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(initialData?.longitude);
  const [mainImage, setMainImage] = useState(initialData?.mainImage || '');
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState('');

  const handleLocationChange = (newCity: string, newLat?: number, newLon?: number) => {
    setCity(newCity);
    setLatitude(newLat);
    setLongitude(newLon);
  };

  const handleImageUpload = (url: string, publicId: string) => {
    setMainImage(url);
    setCloudinaryPublicId(publicId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: any = {
      name,
      description: description || undefined,
      type,
    };

    if (type === 'location') {
      data.city = city;
      data.latitude = latitude;
      data.longitude = longitude;
    }

    if (mainImage) {
      data.mainImage = mainImage;
      data.cloudinaryPublicId = cloudinaryPublicId;
    }

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>
          {t('groups.groupName')} *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={styles.input}
          required
          maxLength={255}
          disabled={loading}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          {t('groups.groupDescription')}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
          rows={4}
          disabled={loading}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="type" className={styles.label}>
          {t('groups.groupType')} *
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as GroupType)}
          className={styles.select}
          required
          disabled={loading}
        >
          <option value="general">{t('groups.general')}</option>
          <option value="location">{t('groups.locationBased')}</option>
        </select>
      </div>

      {type === 'location' && (
        <div className={styles.field}>
          <label className={styles.label}>
            {t('profile.city')} *
          </label>
          <LocationPicker
            value={city}
            latitude={latitude}
            longitude={longitude}
            onChange={handleLocationChange}
          />
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>
          {t('groups.groupImage')}
        </label>
        <ImageUpload
          currentImage={mainImage}
          onUpload={handleImageUpload}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={loading || !name || (type === 'location' && !city)}
      >
        {loading ? t('common.loading') : submitLabel}
      </button>
    </form>
  );
}
