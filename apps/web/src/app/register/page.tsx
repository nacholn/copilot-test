'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/common.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { LocationPicker } from '../../components/LocationPicker';
import { BikeTypeSelector, type BikeType } from '../../components/BikeTypeSelector';
import { CyclingLevelSelector, type CyclingLevel } from '../../components/CyclingLevelSelector';

export default function Register() {
  const router = useRouter();
  const { user, signUp, loading: authLoading } = useAuth();
  const { t } = useTranslations();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    level: 'beginner' as CyclingLevel,
    bikeType: 'road' as BikeType,
    city: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/profile');
    }
  }, [user, authLoading, router]);

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <p>{t('common.loading')}</p>
        </div>
      </main>
    );
  }

  // If user is logged in, don't render the form (redirect is in progress)
  if (user) {
    return null;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordsNotMatch'));
      return;
    }

    setLoading(true);

    try {
      // Use the backend register endpoint which handles both user and profile creation
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          profile: {
            email: formData.email,
            name: formData.name,
            level: formData.level,
            bikeType: formData.bikeType,
            city: formData.city,
            latitude: formData.latitude,
            longitude: formData.longitude,
            dateOfBirth: formData.dateOfBirth || undefined,
          },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || t('register.registrationFailed'));
        return;
      }

      // After successful registration, the user should be automatically logged in
      // The auth context will pick up the session change from Supabase
    } catch (err) {
      setError(t('register.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>{t('register.title')}</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.field}>
            <label>{t('register.email')}</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label>{t('register.name')}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('register.namePlaceholder')}
            />
          </div>
          <div className={styles.field}>
            <label>{t('register.password')}</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label>{t('register.confirmPassword')}</label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>{' '}
          <div className={styles.field}>
            <label>{t('register.cyclingLevel')}</label>
            <CyclingLevelSelector
              value={formData.level}
              onChange={(level) => setFormData({ ...formData, level })}
              required
            />
          </div>
          <div className={styles.field}>
            <label>{t('register.bikeType')}</label>
            <BikeTypeSelector
              value={formData.bikeType}
              onChange={(bikeType) => setFormData({ ...formData, bikeType })}
              required
            />
          </div>
          <div className={styles.field}>
            <label>{t('register.city')}</label>
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
            <label>{t('register.dateOfBirth')}</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? t('register.creatingAccount') : t('register.createAccount')}
          </button>
          <p className={styles.footer}>
            {t('register.alreadyHaveAccount')} <a href="/login">{t('register.signInLink')}</a>
          </p>
        </form>
      </div>
    </main>
  );
}
