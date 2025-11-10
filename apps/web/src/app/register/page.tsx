'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const router = useRouter();
  const { user, signUp, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    level: 'beginner' as const,
    bikeType: 'road' as const,
    city: '',
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
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
            level: formData.level,
            bikeType: formData.bikeType,
            city: formData.city,
            dateOfBirth: formData.dateOfBirth || undefined,
          },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Registration failed');
        return;
      }

      // After successful registration, the user should be automatically logged in
      // The auth context will pick up the session change from Supabase
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Create Account</h1>
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
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label>Confirm Password</label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label>Cycling Level</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Bike Type</label>
            <select
              value={formData.bikeType}
              onChange={(e) => setFormData({ ...formData, bikeType: e.target.value as any })}
            >
              <option value="road">Road</option>
              <option value="mountain">Mountain</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
              <option value="gravel">Gravel</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>City</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label>Date of Birth (Optional)</label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className={styles.footer}>
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </form>
      </div>
    </main>
  );
}
