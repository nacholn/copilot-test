'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/common.module.css';
import loginStyles from './login.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';

// Google Icon Component
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.8055 10.2292C19.8055 9.55149 19.7501 8.8695 19.6323 8.20184H10.2002V12.0492H15.6014C15.3776 13.2908 14.6539 14.3891 13.6048 15.0871V17.5866H16.826C18.7174 15.8449 19.8055 13.2725 19.8055 10.2292Z"
        fill="#4285F4"
      />
      <path
        d="M10.2002 20.0006C12.9506 20.0006 15.2721 19.1151 16.8295 17.5865L13.6083 15.087C12.7087 15.697 11.5469 16.0509 10.2037 16.0509C7.54359 16.0509 5.28263 14.2923 4.48991 11.9097H1.1709V14.4821C2.76156 17.6465 6.31281 20.0006 10.2002 20.0006Z"
        fill="#34A853"
      />
      <path
        d="M4.48648 11.9098C4.0488 10.6682 4.0488 9.33224 4.48648 8.09058V5.51819H1.17095C-0.195568 8.23912 -0.195568 11.7613 1.17095 14.4822L4.48648 11.9098Z"
        fill="#FBBC04"
      />
      <path
        d="M10.2002 3.94936C11.6247 3.92711 13.0003 4.47199 14.0393 5.45762L16.8916 2.60534C15.1858 0.990725 12.9336 0.0782441 10.2002 0.104522C6.31281 0.104522 2.76156 2.45865 1.1709 5.6231L4.48643 8.19549C5.27572 5.80945 7.54012 3.94936 10.2002 3.94936Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function Login() {
  const router = useRouter();
  const { user, signIn, signInWithGoogle, loading: authLoading } = useAuth();
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error);
      }
      // OAuth will redirect to callback route
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

          <div className={loginStyles.divider}>
            <span>{t('common.or')}</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={loginStyles.googleButton}
          >
            <GoogleIcon />
            {t('authModal.continueWithGoogle')}
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
