'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import styles from './profile.module.css';
import commonStyles from '../../styles/common.module.css';
import { API_URL, type Profile } from '@cyclists/config';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { ProfileForm } from '../../components/profile/ProfileForm';
import { Avatar } from '../../components/profile/Avatar';
import { Loader } from '../../components/ui/Loader';
import { ProfileImageGallery } from '../../components/profile/ProfileImageGallery';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    // Only fetch profile if we have a user
    if (!user) return;

    const fetchProfile = async () => {
      try {
        // Use relative path so dev proxy (rewrites) can forward to backend and avoid CORS
        const response = await fetch(`/api/profile?userId=${user.id}`);
        const data = await response.json();

        if (data.success) {
          setProfile(data.data);
        }
        // Profile doesn't exist if 404 - allow user to create one
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);
  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleProfileSave = (savedProfile: Profile) => {
    setProfile(savedProfile);
    setEditing(false);
  };

  if (loading) {
    return (
      <AuthGuard>
        <Loader fullScreen message={t('profile.loadingProfile')} />
      </AuthGuard>
    );
  }

  return (
    <Suspense fallback={<Loader fullScreen message="Loading profile..." />}>
      <AuthGuard>
        <main className={commonStyles.main}>
          <div className={commonStyles.container}>
            <h1 className={commonStyles.title}>{t('profile.title')}</h1>

            {editing ? (
              <div className={styles.editContainer}>
                <h2 className={commonStyles.title} style={{ fontSize: '1.5rem' }}>
                  {t('profile.editTitle')}
                </h2>
                <ProfileForm initialProfile={profile} onSave={handleProfileSave} />
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <button
                    onClick={() => setEditing(false)}
                    className={commonStyles.secondaryButton}
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            ) : profile ? (
              <>
                <div className={commonStyles.avatarContainer}>
                  <Avatar src={profile.avatar} name={profile.name} size="large" />
                </div>

                <div className={commonStyles.details}>
                  <div className={styles.infoCard}>
                    <span className={styles.icon}>👤</span>
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>{t('profile.name')}</span>
                      <span className={styles.infoValue}>{profile.name}</span>
                    </div>
                  </div>
                  <div className={styles.infoCard}>
                    <span className={styles.icon}>✉️</span>
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>{t('profile.email')}</span>
                      <span className={styles.infoValue}>{profile.email}</span>
                    </div>
                  </div>
                  <div className={styles.infoCard}>
                    <span className={styles.icon}>⭐</span>
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>{t('profile.level')}</span>
                      <span className={styles.infoValue}>{t(`levels.${profile.level}`)}</span>
                    </div>
                  </div>
                  <div className={styles.infoCard}>
                    <span className={styles.icon}>🚴</span>
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>{t('profile.bikeType')}</span>
                      <span className={styles.infoValue}>{t(`bikeTypes.${profile.bikeType}`)}</span>
                    </div>
                  </div>
                  <div className={styles.infoCard}>
                    <span className={styles.icon}>📍</span>
                    <div className={styles.infoContent}>
                      <span className={styles.infoLabel}>{t('profile.city')}</span>
                      <span className={styles.infoValue}>{profile.city}</span>
                    </div>
                  </div>
                  {profile.dateOfBirth && (
                    <div className={styles.infoCard}>
                      <span className={styles.icon}>🎂</span>
                      <div className={styles.infoContent}>
                        <span className={styles.infoLabel}>{t('profile.dateOfBirth')}</span>
                        <span className={styles.infoValue}>
                          {new Date(profile.dateOfBirth).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                  {profile.bio && (
                    <div className={styles.infoCard}>
                      <span className={styles.icon}>📝</span>
                      <div className={styles.infoContent}>
                        <span className={styles.infoLabel}>{t('profile.bio')}</span>
                        <span className={styles.infoValue}>{profile.bio}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Images Section */}
                <div className={styles.imagesSection}>
                  <button
                    onClick={() => setShowGallery(!showGallery)}
                    className={commonStyles.secondaryButton}
                    style={{ marginBottom: '1rem' }}
                  >
                    {showGallery ? '− ' : '+ '}
                    {t('profile.images')}
                  </button>
                  {showGallery && user && (
                    <ProfileImageGallery
                      userId={user.id}
                      editable={true}
                      onImageUpdate={() => {
                        // Refetch profile to update avatar
                        const fetchProfile = async () => {
                          const response = await fetch(`/api/profile?userId=${user.id}`);
                          const data = await response.json();
                          if (data.success) {
                            setProfile(data.data);
                          }
                        };
                        fetchProfile();
                      }}
                    />
                  )}
                </div>

                <div className={commonStyles.actions}>
                  <button onClick={() => setEditing(true)} className={commonStyles.primaryButton}>
                    {t('profile.editProfile')}
                  </button>
                  <a href="/" className={commonStyles.secondaryButton}>
                    {t('profile.backToHome')}
                  </a>
                  <button onClick={handleSignOut} className={commonStyles.secondaryButton}>
                    {t('common.signOut')}
                  </button>
                </div>
              </>
            ) : (
              <div>
                <p>{t('profile.welcomeMessage')}</p>
                <ProfileForm onSave={handleProfileSave} />
              </div>
            )}
          </div>
        </main>
      </AuthGuard>
    </Suspense>
  );
}
