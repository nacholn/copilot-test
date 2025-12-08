'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/common.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';

export default function Login() {
  const router = useRouter();
  const { user, signIn, loading: authLoading } = useAuth();
  const { t } = useTranslations();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
        <div className={styles.containerSmall}>
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
    setLoading(true);

    try {
      const result = await signIn(formData.email, formData.password);

      if (result.error) {
        setError(result.error);
        return;
      }

      // The useEffect will handle the redirect once user state is updated
    } catch (err) {
      setError(t('register.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.containerSmall}>
        <h1 className={styles.title}>{t('login.title')}</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label>{t('login.email')}</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label>{t('login.password')}</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? t('login.signingIn') : t('login.signIn')}
          </button>

          <div className={styles.links}>
            <a href="/recover">{t('login.forgotPassword')}</a>
          </div>

          <p className={styles.footer}>
            {t('login.noAccount')} <a href="/register">{t('login.createOne')}</a>
          </p>
        </form>
      </div>
    </main>
  );
}
