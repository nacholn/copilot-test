'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/common.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { LocationPicker } from '../../components/LocationPicker';
import { BikeTypeSelector, type BikeType } from '../../components/BikeTypeSelector';
import { CyclingLevelSelector, type CyclingLevel } from '../../components/CyclingLevelSelector';

type RegistrationStep = 1 | 2 | 3;

interface ProfileData {
  name: string;
  level: CyclingLevel;
  bikeType: BikeType;
  city: string;
  latitude?: number;
  longitude?: number;
  dateOfBirth: string;
  bio: string;
}

export default function Register() {
  const router = useRouter();
  const { user, signUp, signInWithGoogle, loading: authLoading } = useAuth();
  const { t } = useTranslations();
  
  const [step, setStep] = useState<RegistrationStep>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    level: 'beginner' as CyclingLevel,
    bikeType: 'road' as BikeType,
    city: '',
    latitude: undefined,
    longitude: undefined,
    dateOfBirth: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);

  // Check if user is already logged in and has a profile
  useEffect(() => {
    const checkUserProfile = async () => {
      if (user && !authLoading) {
        setCheckingProfile(true);
        try {
          // Check if profile exists
          const response = await fetch(`/api/profile?userId=${user.id}`);
          const data = await response.json();
          
          if (data.success && data.data) {
            // Profile exists, redirect to profile page
            router.push('/profile');
          } else {
            // No profile, check if email is verified
            if (user.email_confirmed_at) {
              setEmailVerified(true);
              setEmail(user.email || '');
              setStep(2); // Go to profile details step
            } else {
              setStep(1); // Stay on auth step
            }
          }
        } catch (err) {
          console.error('Error checking profile:', err);
        } finally {
          setCheckingProfile(false);
        }
      }
    };

    checkUserProfile();
  }, [user, authLoading, router]);

  // Show loading state while checking
  if (authLoading || checkingProfile) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <p>{t('common.loading')}</p>
        </div>
      </main>
    );
  }

  const handleEmailPasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('register.passwordsNotMatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('register.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(email, password);

      if (result.error) {
        setError(result.error);
        return;
      }

      // Show message about email verification
      setError('');
      setStep(1); // Stay on step 1 to show verification message
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError(t('register.notAuthenticated'));
      return;
    }

    setLoading(true);

    try {
      // Create profile
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          isOAuth: true,
          profile: {
            email: user.email,
            name: profileData.name,
            level: profileData.level,
            bikeType: profileData.bikeType,
            city: profileData.city,
            latitude: profileData.latitude,
            longitude: profileData.longitude,
            dateOfBirth: profileData.dateOfBirth || undefined,
            bio: profileData.bio || undefined,
          },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || t('register.registrationFailed'));
        return;
      }

      // Move to summary step
      setStep(3);
    } catch (err) {
      setError(t('register.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeRegistration = () => {
    router.push('/profile');
  };

  // Step 1: Authentication
  if (step === 1) {
    return (
      <main className={styles.main}>
        <div className={styles.containerSmall}>
          <h1 className={styles.title}>{t('register.title')}</h1>
          <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
            {t('register.step1Description')}
          </p>

          {user && !emailVerified && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffc107',
              borderRadius: '8px',
              marginBottom: '1rem',
              color: '#856404'
            }}>
              {t('register.verifyEmailMessage')}
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleEmailPasswordSignUp} className={styles.form}>
            <div className={styles.field}>
              <label>{t('register.email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!user}
              />
            </div>

            <div className={styles.field}>
              <label>{t('register.password')}</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!!user}
              />
            </div>

            <div className={styles.field}>
              <label>{t('register.confirmPassword')}</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!!user}
              />
            </div>

            <button type="submit" disabled={loading || !!user} className={styles.submitButton}>
              {loading ? t('register.creatingAccount') : t('register.signUpWithEmail')}
            </button>
          </form>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '1.5rem 0',
            color: '#999'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
            <span style={{ padding: '0 1rem' }}>{t('common.or')}</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || !!user}
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#333',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.8055 10.2292C19.8055 9.55149 19.7501 8.8695 19.6323 8.20184H10.2002V12.0492H15.6014C15.3776 13.2908 14.6539 14.3891 13.6048 15.0871V17.5866H16.826C18.7174 15.8449 19.8055 13.2725 19.8055 10.2292Z" fill="#4285F4"/>
              <path d="M10.2002 20.0006C12.9506 20.0006 15.2721 19.1151 16.8295 17.5865L13.6083 15.087C12.7087 15.697 11.5469 16.0509 10.2037 16.0509C7.54359 16.0509 5.28263 14.2923 4.48991 11.9097H1.1709V14.4821C2.76156 17.6465 6.31281 20.0006 10.2002 20.0006Z" fill="#34A853"/>
              <path d="M4.48648 11.9098C4.0488 10.6682 4.0488 9.33224 4.48648 8.09058V5.51819H1.17095C-0.195568 8.23912 -0.195568 11.7613 1.17095 14.4822L4.48648 11.9098Z" fill="#FBBC04"/>
              <path d="M10.2002 3.94936C11.6247 3.92711 13.0003 4.47199 14.0393 5.45762L16.8916 2.60534C15.1858 0.990725 12.9336 0.0782441 10.2002 0.104522C6.31281 0.104522 2.76156 2.45865 1.1709 5.6231L4.48643 8.19549C5.27572 5.80945 7.54012 3.94936 10.2002 3.94936Z" fill="#EA4335"/>
            </svg>
            {t('register.signUpWithGoogle')}
          </button>

          <p className={styles.footer}>
            {t('register.alreadyHaveAccount')} <a href="/login">{t('register.signInLink')}</a>
          </p>
        </div>
      </main>
    );
  }

  // Step 2: Profile Details
  if (step === 2) {
    return (
      <main className={styles.main}>
        <div className={styles.containerSmall}>
          <h1 className={styles.title}>{t('register.profileDetailsTitle')}</h1>
          <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
            {t('register.step2Description')}
          </p>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleProfileSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>{t('register.name')}</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder={t('register.namePlaceholder')}
              />
            </div>

            <div className={styles.field}>
              <label>{t('register.cyclingLevel')}</label>
              <CyclingLevelSelector
                value={profileData.level}
                onChange={(level) => setProfileData({ ...profileData, level })}
                required
              />
            </div>

            <div className={styles.field}>
              <label>{t('register.bikeType')}</label>
              <BikeTypeSelector
                value={profileData.bikeType}
                onChange={(bikeType) => setProfileData({ ...profileData, bikeType })}
                required
              />
            </div>

            <div className={styles.field}>
              <label>{t('register.city')}</label>
              <LocationPicker
                value={profileData.city}
                latitude={profileData.latitude}
                longitude={profileData.longitude}
                onChange={(city, latitude, longitude) =>
                  setProfileData({ ...profileData, city, latitude, longitude })
                }
              />
            </div>

            <div className={styles.field}>
              <label>{t('register.dateOfBirth')}</label>
              <input
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label>{t('register.bio')}</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder={t('register.bioPlaceholder')}
                rows={4}
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? t('common.loading') : t('register.continueToSummary')}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Step 3: Summary
  return (
    <main className={styles.main}>
      <div className={styles.containerSmall}>
        <h1 className={styles.title}>{t('register.summaryTitle')}</h1>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
          {t('register.step3Description')}
        </p>

        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <strong>{t('register.email')}:</strong> {email}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>{t('register.name')}:</strong> {profileData.name}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>{t('register.cyclingLevel')}:</strong> {t(`cyclingLevel.${profileData.level}`)}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>{t('register.bikeType')}:</strong> {t(`bikeType.${profileData.bikeType}`)}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>{t('register.city')}:</strong> {profileData.city}
          </div>
          {profileData.dateOfBirth && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>{t('register.dateOfBirth')}:</strong> {profileData.dateOfBirth}
            </div>
          )}
          {profileData.bio && (
            <div>
              <strong>{t('register.bio')}:</strong> {profileData.bio}
            </div>
          )}
        </div>

        <button
          onClick={handleFinalizeRegistration}
          className={styles.submitButton}
        >
          {t('register.completeRegistration')}
        </button>

        <button
          onClick={() => setStep(2)}
          style={{
            width: '100%',
            padding: '0.875rem',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: 'white',
            color: '#333',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            marginTop: '1rem',
          }}
        >
          {t('common.back')}
        </button>
      </div>
    </main>
  );
}
