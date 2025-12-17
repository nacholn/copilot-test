'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Group, GroupType } from '@bicicita/config';
import styles from '../../../../styles/common.module.css';
import { LocationPicker } from '../../../../components/LocationPicker';
import { GroupTypeSelector } from '../../../../components/GroupTypeSelector';
import { ImageUpload } from '../../../../components/ImageUpload';

interface GroupUpdateInput {
  name?: string;
  description?: string;
  type?: GroupType;
  slug?: string;
  metaDescription?: string;
  keywords?: string;
  mainImage?: string;
  mainImagePublicId?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export default function EditGroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GroupType>('general');
  const [slug, setSlug] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [mainImagePublicId, setMainImagePublicId] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  // Generate slug from name
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    // Auto-generate slug if it's currently empty or matches the auto-generated version from original
    if (!slug || (group && slug === generateSlug(group.name))) {
      setSlug(generateSlug(newName));
    }
  };

  // Fetch group data
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/groups/${groupId}`);
        const data = await response.json();

        if (data.success && data.data) {
          const groupData = data.data as Group;
          setGroup(groupData);
          setName(groupData.name);
          setDescription(groupData.description || '');
          setType(groupData.type);
          setSlug(groupData.slug || '');
          setMetaDescription(groupData.metaDescription || '');
          setKeywords(groupData.keywords || '');
          setMainImage(groupData.mainImage || '');
          setMainImagePublicId(groupData.mainImagePublicId || '');
          setCity(groupData.city || '');
          setLatitude(groupData.latitude);
          setLongitude(groupData.longitude);
        } else {
          setError(data.error || 'Failed to fetch group');
        }
      } catch (err) {
        console.error('Error fetching group:', err);
        setError('Failed to fetch group');
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroup();
    }
  }, [groupId]);

  const handleLocationChange = (newCity: string, newLat?: number, newLng?: number) => {
    setCity(newCity);
    setLatitude(newLat);
    setLongitude(newLng);
  };
  const handleImageChange = (url: string | null, publicId?: string) => {
    setMainImage(url || '');
    setMainImagePublicId(publicId || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const updates: GroupUpdateInput = {};

    if (name !== group.name) {
      updates.name = name;
    }

    if (description !== (group.description || '')) {
      updates.description = description;
    }

    if (type !== group.type) {
      updates.type = type;
    }

    if (slug !== (group.slug || '')) {
      updates.slug = slug;
    }

    if (metaDescription !== (group.metaDescription || '')) {
      updates.metaDescription = metaDescription;
    }

    if (keywords !== (group.keywords || '')) {
      updates.keywords = keywords;
    }

    if (mainImage !== (group.mainImage || '')) {
      updates.mainImage = mainImage;
      updates.mainImagePublicId = mainImagePublicId;
    }

    if (city !== (group.city || '')) {
      updates.city = city;
    }

    if (latitude !== group.latitude) {
      updates.latitude = latitude;
    }

    if (longitude !== group.longitude) {
      updates.longitude = longitude;
    }

    if (Object.keys(updates).length === 0) {
      setError('No changes to save');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Group updated successfully!');
        setGroup(data.data);
        setTimeout(() => {
          router.push('/groups');
        }, 1500);
      } else {
        setError(data.error || 'Failed to update group');
      }
    } catch (err) {
      console.error('Error updating group:', err);
      setError('Failed to update group');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading group...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.error}>{error || 'Group not found'}</p>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={() => router.push('/groups')}
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Edit Group</h1>
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={() => router.push('/groups')}
          >
            ← Back to Groups
          </button>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.card}>
          {error && <div className={styles.error}>{error}</div>}
          {successMessage && <div className={styles.success}>{successMessage}</div>}

          <form onSubmit={handleSubmit}>
            {/* Group info */}
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
              <strong>ID:</strong> {group.id} |
              <strong style={{ marginLeft: '8px' }}>Created:</strong>{' '}
              {new Date(group.createdAt).toLocaleDateString()}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Name
                <span className={styles.labelHint}>The group name</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter group name..."
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Description
                <span className={styles.labelHint}>A brief description of the group</span>
              </label>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter group description..."
                rows={4}
              />
            </div>{' '}
            <GroupTypeSelector value={type} onChange={setType} />
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
                placeholder="group-url-slug"
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                title="Slug must contain only lowercase letters, numbers, and hyphens"
              />
              <small className={styles.charCount}>Preview: /groups/{slug || 'group-slug'}</small>
            </div>
            <hr style={{ margin: '24px 0', borderColor: '#e2e8f0' }} />
            <h3 style={{ marginBottom: '16px', color: '#4a5568' }}>Location</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                City
                <span className={styles.labelHint}>Search for a city location</span>
              </label>
              <LocationPicker
                value={city}
                latitude={latitude}
                longitude={longitude}
                onChange={handleLocationChange}
              />
              {latitude && longitude && (
                <small className={styles.charCount}>
                  Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </small>
              )}
            </div>
            <hr style={{ margin: '24px 0', borderColor: '#e2e8f0' }} />
            <h3 style={{ marginBottom: '16px', color: '#4a5568' }}>Group Image</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Main Image
                <span className={styles.labelHint}>Upload or change the group image</span>
              </label>{' '}
              <ImageUpload
                currentImage={mainImage}
                onImageChange={handleImageChange}
                folder="groups"
              />
            </div>
            <hr style={{ margin: '24px 0', borderColor: '#e2e8f0' }} />
            <h3 style={{ marginBottom: '16px', color: '#4a5568' }}>SEO Settings</h3>
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
                placeholder="Brief description of the group for search engines..."
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
                placeholder="cycling, group rides, mountain biking"
              />
            </div>
            <div className={styles.formActions}>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={() => router.push('/groups')}
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
