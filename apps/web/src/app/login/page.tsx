'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const router = useRouter();
  const { user, signIn, loading: authLoading } = useAuth();
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
        <div className={styles.container}>
          <p>Loading...</p>
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
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome Back</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className={styles.links}>
            <a href="/recover">Forgot password?</a>
          </div>

          <p className={styles.footer}>
            Don&apos;t have an account? <a href="/register">Create one</a>
          </p>
        </form>
      </div>
    </main>
  );
}
