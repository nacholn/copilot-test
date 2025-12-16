'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { type Profile } from '@cyclists/config';
import { LocationPicker } from '../forms/LocationPicker';
import { ImageUpload } from '../forms/ImageUpload';
import { BikeTypeSelector, type BikeType } from '../selectors/BikeTypeSelector';
import { CyclingLevelSelector, type CyclingLevel } from '../selectors/CyclingLevelSelector';
import styles from '../../styles/common.module.css';

interface ProfileFormProps {
  initialProfile?: Profile | null;
  onSave?: (profile: Profile) => void;
}

export function ProfileForm({ initialProfile, onSave }: ProfileFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    level: 'beginner' as CyclingLevel,
    bikeType: 'road' as BikeType,
    city: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    dateOfBirth: '',
    avatar: '',
    bio: '',
  });

  useEffect(() => {
    if (initialProfile) {
      setFormData({
        email: initialProfile.email,
        name: initialProfile.name,
        level: initialProfile.level,
        bikeType: initialProfile.bikeType,
        city: initialProfile.city,
        latitude: initialProfile.latitude,
        longitude: initialProfile.longitude,
        dateOfBirth: initialProfile.dateOfBirth
          ? new Date(initialProfile.dateOfBirth).toISOString().split('T')[0]
          : '',
        avatar: initialProfile.avatar || '',
        bio: initialProfile.bio || '',
      });
    } else if (user) {
      // For new profiles, pre-fill email from user data
      setFormData((prev) => ({ ...prev, email: user.email || '' }));
    }
  }, [initialProfile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const isUpdate = Boolean(initialProfile);
      const url = `/api/profile${isUpdate ? `?userId=${user.id}` : ''}`;
      const method = isUpdate ? 'PATCH' : 'POST';

      const payload = isUpdate
        ? {
            email: formData.email,
            name: formData.name,
            level: formData.level,
            bikeType: formData.bikeType,
            city: formData.city,
            latitude: formData.latitude,
            longitude: formData.longitude,
            dateOfBirth: formData.dateOfBirth || undefined,
            avatar: formData.avatar || undefined,
            bio: formData.bio || undefined,
          }
        : {
            userId: user.id,
            email: formData.email,
            name: formData.name,
            level: formData.level,
            bikeType: formData.bikeType,
            city: formData.city,
            latitude: formData.latitude,
            longitude: formData.longitude,
            dateOfBirth: formData.dateOfBirth || undefined,
            avatar: formData.avatar || undefined,
            bio: formData.bio || undefined,
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to save profile');
        return;
      }

      if (onSave) {
        onSave(data.data);
      } else {
        router.push('/profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.field}>
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div className={styles.field}>
        <label>Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>{' '}
      <div className={styles.field}>
        <label>Cycling Level</label>
        <CyclingLevelSelector
          value={formData.level}
          onChange={(level) => setFormData({ ...formData, level })}
          required
        />
      </div>
      <div className={styles.field}>
        <label>Bike Type</label>
        <BikeTypeSelector
          value={formData.bikeType}
          onChange={(bikeType) => setFormData({ ...formData, bikeType })}
          required
        />
      </div>
      <div className={styles.field}>
        <label>City</label>
        <LocationPicker
          value={formData.city}
          latitude={formData.latitude}
          longitude={formData.longitude}
          onChange={(city, latitude, longitude) =>
            setFormData({ ...formData, city, latitude, longitude })
          }
        />
      </div>
      <div className={styles.field}>
        <label>Date of Birth (Optional)</label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
        />
      </div>{' '}
      <div className={styles.field}>
        <label>Profile Image</label>
        <ImageUpload
          currentImage={formData.avatar}
          folder="cyclists/profiles"
          onImageChange={(imageUrl) => setFormData({ ...formData, avatar: imageUrl || '' })}
          size="medium"
        />
      </div>
      <div className={styles.field}>
        <label>Bio (Optional)</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about yourself and your cycling experience..."
          rows={4}
        />
      </div>
      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'Saving...' : initialProfile ? 'Update Profile' : 'Create Profile'}
      </button>
    </form>
  );
}
