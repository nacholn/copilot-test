'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { LocationPicker } from '../forms/LocationPicker';
import { BikeTypeSelector, type BikeType } from '../selectors/BikeTypeSelector';
import { CyclingLevelSelector, type CyclingLevel } from '../selectors/CyclingLevelSelector';
import { getSupabaseClient } from '@bicicita/config';
import styles from './AuthModal.module.css';

type RegistrationStep = 1 | 2 | 3;
type AuthMode = 'login' | 'register';

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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const router = useRouter();
  const { user, signIn, signUp, signInWithGoogle, loading: authLoading } = useAuth();
  const { t } = useTranslations();

  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<RegistrationStep>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [awaitingEmailVerification, setAwaitingEmailVerification] = useState(false);
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
  const [checkingVerification, setCheckingVerification] = useState(false);

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep(1);
      setError('');
      setAwaitingEmailVerification(false);
    }
  }, [isOpen, initialMode]);

  // Check if user is authenticated and handle step progression
  useEffect(() => {
    const checkUserStatus = async () => {
      // Only run this logic when the modal is actually open
      if (!isOpen) return;

      if (user && !authLoading && mode === 'register') {
        try {
          // Check if profile exists
          const response = await fetch(`/api/profile?userId=${user.id}`);
          const data = await response.json();

          if (data.success && data.data) {
            // Profile exists, close modal and redirect
            onClose();
            router.push('/profile');
          } else if (user.email_confirmed_at) {
            // Email verified, go to profile step
            setAwaitingEmailVerification(false);
            setEmail(user.email || '');
            setStep(2);
          } else {
            // Still waiting for email verification
            setAwaitingEmailVerification(true);
          }
        } catch (err) {
          console.error('Error checking user status:', err);
        }
      } else if (user && !authLoading && mode === 'login') {
        // Login successful, close modal
        onClose();
        router.push('/profile');
      }
    };

    checkUserStatus();
  }, [user, authLoading, mode, router, onClose, isOpen]); // Poll for email verification when waiting
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (awaitingEmailVerification && email) {
      const checkVerification = async () => {
        setCheckingVerification(true);
        try {
          // Call backend API to check verification status
          // Backend uses admin API with service_role key to check user's email_confirmed_at
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
              setPassword(''); // Clear password from state after successful login
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.error) {
        setError(result.error);
      }
      // Redirect is handled by useEffect
    } catch (err) {
      setError(t('register.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

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

      // Success - close modal and redirect
      onClose();
      router.push('/profile');
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

  const switchMode = useCallback(() => {
    setMode(mode === 'login' ? 'register' : 'login');
    setStep(1);
    setError('');
    setAwaitingEmailVerification(false);
  }, [mode]);

  // Don't render if not open or not mounted (SSR safety)
  if (!isOpen || !mounted) return null;

  // Render step indicators for registration
  const renderStepIndicator = () => {
    if (mode !== 'register') return null;

    return (
      <div className={styles.stepIndicator}>
        <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>
          <span className={styles.stepNumber}>1</span>
          <span className={styles.stepLabel}>{t('authModal.stepAuth')}</span>
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>
          <span className={styles.stepNumber}>2</span>
          <span className={styles.stepLabel}>{t('authModal.stepProfile')}</span>
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.step} ${step >= 3 ? styles.stepActive : ''}`}>
          <span className={styles.stepNumber}>3</span>
          <span className={styles.stepLabel}>{t('authModal.stepSummary')}</span>
        </div>
      </div>
    );
  };

  // Manual verification check - re-authenticate to get updated session
  const handleManualVerificationCheck = async () => {
    setCheckingVerification(true);
    setError('');

    try {
      const supabase = getSupabaseClient();

      // If we have the password, try to re-authenticate to get fresh session
      if (password && email) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!signInError && signInData.user?.email_confirmed_at) {
          setAwaitingEmailVerification(false);
          setStep(2);
          return;
        }

        if (signInError) {
          // Check if it's because email not confirmed
          if (signInError.message.includes('Email not confirmed')) {
            setError(t('authModal.emailNotVerifiedYet'));
            return;
          }
        }
      }

      // Fallback: try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (!refreshError && refreshData.session?.user?.email_confirmed_at) {
        setAwaitingEmailVerification(false);
        setEmail(refreshData.session.user.email || '');
        setStep(2);
        return;
      }

      // Last resort: try getUser
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (!userError && userData.user?.email_confirmed_at) {
        setAwaitingEmailVerification(false);
        setEmail(userData.user.email || '');
        setStep(2);
        return;
      }

      setError(t('authModal.emailNotVerifiedYet'));
    } catch (err) {
      console.error('Verification check error:', err);
      setError(t('authModal.verificationCheckFailed'));
    } finally {
      setCheckingVerification(false);
    }
  };

  // Step 1: Authentication (Login or Register)
  const renderAuthStep = () => {
    // Email verification waiting state
    if (awaitingEmailVerification) {
      return (
        <div className={styles.verificationContainer}>
          <div className={styles.verificationIcon}>📧</div>
          <h2 className={styles.verificationTitle}>{t('authModal.verifyEmailTitle')}</h2>
          <p className={styles.verificationText}>{t('authModal.verifyEmailText')}</p>
          <p className={styles.verificationEmail}>{email}</p>

          <div className={styles.pollingInfo}>
            <span className={styles.pulsingDot} />
            <span>{t('authModal.autoCheckingEvery5Seconds')}</span>
          </div>

          {checkingVerification && (
            <div className={styles.checkingStatus}>
              <span className={styles.spinner} />
              {t('authModal.checkingVerification')}
            </div>
          )}

          <div className={styles.verificationButtons}>
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
              className={styles.secondaryButton}
            >
              {loading ? t('common.loading') : t('authModal.resendEmail')}
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </div>
      );
    }

    if (mode === 'login') {
      return (
        <form onSubmit={handleLogin} className={styles.form}>
          <h2 className={styles.title}>{t('login.title')}</h2>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label>{t('login.email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label>{t('login.password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? t('login.signingIn') : t('login.signIn')}
          </button>

          <div className={styles.divider}>
            <span>{t('common.or')}</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={styles.googleButton}
          >
            <GoogleIcon />
            {t('authModal.continueWithGoogle')}
          </button>

          <div className={styles.links}>
            <a href="/recover">{t('login.forgotPassword')}</a>
          </div>

          <p className={styles.switchMode}>
            {t('login.noAccount')}{' '}
            <button type="button" onClick={switchMode} className={styles.switchButton}>
              {t('login.createOne')}
            </button>
          </p>
        </form>
      );
    }

    // Register mode - Step 1
    return (
      <form onSubmit={handleEmailPasswordSignUp} className={styles.form}>
        <h2 className={styles.title}>{t('register.title')}</h2>
        <p className={styles.description}>{t('register.step1Description')}</p>

        {error && <div className={styles.error}>{error}</div>}

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

        <div className={styles.divider}>
          <span>{t('common.or')}</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={styles.googleButton}
        >
          <GoogleIcon />
          {t('register.signUpWithGoogle')}
        </button>

        <p className={styles.switchMode}>
          {t('register.alreadyHaveAccount')}{' '}
          <button type="button" onClick={switchMode} className={styles.switchButton}>
            {t('register.signInLink')}
          </button>
        </p>
      </form>
    );
  };

  // Step 2: Profile Details
  const renderProfileStep = () => (
    <form onSubmit={handleProfileSubmit} className={styles.form}>
      <h2 className={styles.title}>{t('register.profileDetailsTitle')}</h2>
      <p className={styles.description}>{t('register.step2Description')}</p>

      {error && <div className={styles.error}>{error}</div>}

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

      <button type="button" onClick={() => setStep(1)} className={styles.backButton}>
        {t('common.back')}
      </button>
    </form>
  );

  // Step 3: Summary
  const renderSummaryStep = () => (
    <div className={styles.summary}>
      <h2 className={styles.title}>{t('register.summaryTitle')}</h2>
      <p className={styles.description}>{t('register.step3Description')}</p>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.summaryCard}>
        <div className={styles.summaryItem}>
          <strong>{t('register.email')}:</strong>
          <span>{user?.email || email}</span>
        </div>
        <div className={styles.summaryItem}>
          <strong>{t('register.name')}:</strong>
          <span>{profileData.name}</span>
        </div>
        <div className={styles.summaryItem}>
          <strong>{t('register.cyclingLevel')}:</strong>
          <span>{t(`levels.${profileData.level}`)}</span>
        </div>
        <div className={styles.summaryItem}>
          <strong>{t('register.bikeType')}:</strong>
          <span>{t(`bikeTypes.${profileData.bikeType}`)}</span>
        </div>
        {profileData.city && (
          <div className={styles.summaryItem}>
            <strong>{t('register.city')}:</strong>
            <span>{profileData.city}</span>
          </div>
        )}
        {profileData.dateOfBirth && (
          <div className={styles.summaryItem}>
            <strong>{t('register.dateOfBirth')}:</strong>
            <span>{profileData.dateOfBirth}</span>
          </div>
        )}
        {profileData.bio && (
          <div className={styles.summaryItem}>
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

      <button type="button" onClick={() => setStep(2)} className={styles.backButton}>
        {t('common.back')}
      </button>
    </div>
  );

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          ×
        </button>

        {mode === 'register' && renderStepIndicator()}

        <div className={styles.content}>
          {step === 1 && renderAuthStep()}
          {step === 2 && renderProfileStep()}
          {step === 3 && renderSummaryStep()}
        </div>
      </div>
    </div>,
    document.body
  );
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
