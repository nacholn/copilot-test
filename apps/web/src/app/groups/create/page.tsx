'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslations } from '../../../hooks/useTranslations';
import { AuthGuard } from '../../../components/AuthGuard';
import { Loader } from '../../../components/Loader';
import type { CreateGroupInput } from '@cyclists/config';
import styles from './create.module.css';

export default function CreateGroup() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const groupInput: CreateGroupInput = {
        name: formData.name,
        description: formData.description || undefined,
        location: formData.location || 'general',
        createdBy: user.id,
      };

      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupInput),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/groups/${data.data.id}`);
      } else {
        setError(data.error || t('common.error'));
      }
    } catch (err) {
      console.error('Error creating group:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>{t('groups.createGroup')}</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                {t('groups.groupName')} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('groups.groupNamePlaceholder')}
                className={styles.input}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                {t('groups.description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('groups.descriptionPlaceholder')}
                className={styles.textarea}
                rows={4}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location" className={styles.label}>
                {t('groups.location')}
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={t('groups.locationPlaceholder')}
                className={styles.input}
                disabled={loading}
              />
              <small className={styles.hint}>
                Leave empty for global group, or enter a city name
              </small>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                onClick={() => router.back()}
                className={styles.cancelButton}
                disabled={loading}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading || !formData.name}
              >
                {loading ? <Loader size="small" /> : t('groups.createGroup')}
              </button>
            </div>
          </form>
        </div>
      </main>
    </AuthGuard>
  );
}
