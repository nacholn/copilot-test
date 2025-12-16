'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/common.module.css';
import registerStyles from './register.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { LocationPicker } from '../../components/LocationPicker';
import { BikeTypeSelector, type BikeType } from '../../components/BikeTypeSelector';
import { CyclingLevelSelector, type CyclingLevel } from '../../components/CyclingLevelSelector';
import { getSupabaseClient } from '@cyclists/config';
import { Loader } from '../../components/Loader';

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

export default function Register() {
  const router = useRouter();
  const { user, signUp, signInWithGoogle, loading: authLoading } = useAuth();
  const { t } = useTranslations();

  const [step, setStep] = useState<RegistrationStep>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [awaitingEmailVerification, setAwaitingEmailVerification] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
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
              setAwaitingEmailVerification(false);
              setEmail(user.email || '');
              setStep(2); // Go to profile details step
            } else {
              setAwaitingEmailVerification(true);
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

  // Poll for email verification when waiting
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (awaitingEmailVerification && email) {
      const checkVerification = async () => {
        setCheckingVerification(true);
        try {
          // Call backend API to check verification status
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const response = await fetch(`${apiUrl}/api/auth/check-verification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();

          if (data.success && data.verified) {
            // Email is verified, now sign in the user
            const supabase = getSupabaseClient();

            // Try to sign in - this will create a session for the verified user
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (!signInError) {
              setAwaitingEmailVerification(false);
              setPassword(''); // Clear password from state
              setConfirmPassword('');
              setStep(2);
            }
          }
        } catch (err) {
          console.error('Error checking verification:', err);
        } finally {
          setCheckingVerification(false);
        }
      };

      // Check immediately on mount
      checkVerification();

      // Then poll every 5 seconds
      interval = setInterval(checkVerification, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [awaitingEmailVerification, email, password]);

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

      // Show email verification message
      setAwaitingEmailVerification(true);
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

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        setError(error.message || t('authModal.resendFailed'));
      }
    } catch (err) {
      setError(t('register.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerificationCheck = async () => {
    setCheckingVerification(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/auth/check-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success && data.verified) {
        // Email is verified, now sign in the user
        const supabase = getSupabaseClient();

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!signInError) {
          setAwaitingEmailVerification(false);
          setPassword('');
          setConfirmPassword('');
          setStep(2);
        } else {
          setError(t('authModal.verificationCheckFailed'));
        }
      } else {
        setError(t('authModal.emailNotVerifiedYet'));
      }
    } catch (err) {
      setError(t('authModal.verificationCheckFailed'));
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError(t('register.notAuthenticated'));
      return;
    }

    if (!profileData.name.trim()) {
      setError(t('authModal.nameRequired'));
      return;
    }

    // Move to summary step
    setStep(3);
  };

  const handleFinalizeRegistration = async () => {
    if (!user) {
      setError(t('register.notAuthenticated'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get current session for authorization
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError(t('register.notAuthenticated'));
        return;
      }

      // Create profile
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
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

      // Success - redirect to profile
      router.push('/profile');
    } catch (err) {
      setError(t('register.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className={registerStyles.stepIndicator}>
      <div className={`${registerStyles.step} ${step >= 1 ? registerStyles.stepActive : ''}`}>
        <span className={registerStyles.stepNumber}>1</span>
        <span className={registerStyles.stepLabel}>{t('authModal.stepAuth')}</span>
      </div>
      <div className={registerStyles.stepLine} />
      <div className={`${registerStyles.step} ${step >= 2 ? registerStyles.stepActive : ''}`}>
        <span className={registerStyles.stepNumber}>2</span>
        <span className={registerStyles.stepLabel}>{t('authModal.stepProfile')}</span>
      </div>
      <div className={registerStyles.stepLine} />
      <div className={`${registerStyles.step} ${step >= 3 ? registerStyles.stepActive : ''}`}>
        <span className={registerStyles.stepNumber}>3</span>
        <span className={registerStyles.stepLabel}>{t('authModal.stepSummary')}</span>
      </div>
    </div>
  );

  // Step 1: Authentication
  if (step === 1) {
    // Email verification waiting state
    if (awaitingEmailVerification) {
      return (
        <main className={styles.main}>
          <div className={styles.containerSmall}>
            {renderStepIndicator()}
            <div className={registerStyles.verificationContainer}>
              <div className={registerStyles.verificationIcon}>📧</div>
              <h2 className={registerStyles.verificationTitle}>
                {t('authModal.verifyEmailTitle')}
              </h2>
              <p className={registerStyles.verificationText}>{t('authModal.verifyEmailText')}</p>
              <p className={registerStyles.verificationEmail}>{email}</p>

              <div className={registerStyles.pollingInfo}>
                <span className={registerStyles.pulsingDot} />
                <span>{t('authModal.autoCheckingEvery5Seconds')}</span>
              </div>

              {checkingVerification && (
                <div className={registerStyles.checkingStatus}>
                  <span className={registerStyles.spinner} />
                  {t('authModal.checkingVerification')}
                </div>
              )}

              <div className={registerStyles.verificationButtons}>
                <button
                  type="button"
                  onClick={handleManualVerificationCheck}
                  disabled={checkingVerification}
                  className={styles.submitButton}
                >
                  {checkingVerification
                    ? t('authModal.checkingVerification')
                    : t('authModal.checkManually')}
                </button>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={loading}
                  className={registerStyles.secondaryButton}
                >
                  {loading ? t('common.loading') : t('authModal.resendEmail')}
                </button>
              </div>

              {error && <div className={styles.error}>{error}</div>}
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className={styles.main}>
        <div className={styles.containerSmall}>
          {renderStepIndicator()}
          <h1 className={styles.title}>{t('register.title')}</h1>
          <p className={registerStyles.description}>{t('register.step1Description')}</p>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleEmailPasswordSignUp} className={styles.form}>
            <div className={styles.field}>
              <label>{t('register.email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
                autoComplete="new-password"
              />
            </div>

            <div className={styles.field}>
              <label>{t('register.confirmPassword')}</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? t('register.creatingAccount') : t('register.signUpWithEmail')}
            </button>
          </form>

          <div className={registerStyles.divider}>
            <span>{t('common.or')}</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={registerStyles.googleButton}
          >
            <GoogleIcon />
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
          {renderStepIndicator()}
          <h1 className={styles.title}>{t('register.profileDetailsTitle')}</h1>
          <p className={registerStyles.description}>{t('register.step2Description')}</p>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleProfileSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>{t('register.name')} *</label>
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
                rows={3}
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
              {t('register.continueToSummary')}
            </button>

            <button type="button" onClick={() => setStep(1)} className={registerStyles.backButton}>
              {t('common.back')}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Step 3: Summary
  return (
    <Suspense fallback={<Loader fullScreen message="Loading registration..." />}>
      <main className={styles.main}>
        <div className={styles.containerSmall}>
          {renderStepIndicator()}
          <h1 className={styles.title}>{t('register.summaryTitle')}</h1>
          <p className={registerStyles.description}>{t('register.step3Description')}</p>

          {error && <div className={styles.error}>{error}</div>}

          <div className={registerStyles.summaryCard}>
            <div className={registerStyles.summaryItem}>
              <strong>{t('register.email')}:</strong>
              <span>{user?.email || email}</span>
            </div>
            <div className={registerStyles.summaryItem}>
              <strong>{t('register.name')}:</strong>
              <span>{profileData.name}</span>
            </div>
            <div className={registerStyles.summaryItem}>
              <strong>{t('register.cyclingLevel')}:</strong>
              <span>{t(`levels.${profileData.level}`)}</span>
            </div>
            <div className={registerStyles.summaryItem}>
              <strong>{t('register.bikeType')}:</strong>
              <span>{t(`bikeTypes.${profileData.bikeType}`)}</span>
            </div>
            {profileData.city && (
              <div className={registerStyles.summaryItem}>
                <strong>{t('register.city')}:</strong>
                <span>{profileData.city}</span>
              </div>
            )}
            {profileData.dateOfBirth && (
              <div className={registerStyles.summaryItem}>
                <strong>{t('register.dateOfBirth')}:</strong>
                <span>{profileData.dateOfBirth}</span>
              </div>
            )}
            {profileData.bio && (
              <div className={registerStyles.summaryItem}>
                <strong>{t('register.bio')}:</strong>
                <span>{profileData.bio}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleFinalizeRegistration}
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? t('common.loading') : t('register.completeRegistration')}
          </button>

          <button type="button" onClick={() => setStep(2)} className={registerStyles.backButton}>
            {t('common.back')}
          </button>
        </div>
      </main>
    </Suspense>
  );
}
