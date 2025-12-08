'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './profile.module.css';
import commonStyles from '../../styles/common.module.css';
import { API_URL, type Profile } from '@cyclists/config';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { AuthGuard } from '../../components/AuthGuard';
import { ProfileForm } from '../../components/ProfileForm';
import { Avatar } from '../../components/Avatar';
import { Loader } from '../../components/Loader';
import { ProfileImageGallery } from '../../components/ProfileImageGallery';

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
    <AuthGuard>
      <main className={commonStyles.main}>
        <div className={commonStyles.container}>
          <h1 className={commonStyles.title}>{t('profile.title')}</h1>

          {editing ? (
            <div className={styles.editContainer}>
              <h2 className={commonStyles.title} style={{ fontSize: '1.5rem' }}>{t('profile.editTitle')}</h2>
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
                <div className={commonStyles.field}>
                  <strong>{t('profile.name')}:</strong> {profile.name}
                </div>
                <div className={commonStyles.field}>
                  <strong>{t('profile.email')}:</strong> {profile.email}
                </div>
                <div className={commonStyles.field}>
                  <strong>{t('profile.level')}:</strong> {t(`levels.${profile.level}`)}
                </div>
                <div className={commonStyles.infoField}>
                  <strong>{t('profile.bikeType')}:</strong> {t(`bikeTypes.${profile.bikeType}`)}
                </div>
                <div className={commonStyles.infoField}>
                  <strong>{t('profile.city')}:</strong> {profile.city}
                </div>
                {profile.dateOfBirth && (
                  <div className={commonStyles.infoField}>
                    <strong>{t('profile.dateOfBirth')}:</strong>{' '}
                    {new Date(profile.dateOfBirth).toLocaleDateString()}
                  </div>
                )}
                {profile.bio && (
                  <div className={commonStyles.infoField}>
                    <strong>{t('profile.bio')}:</strong> {profile.bio}
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
                  {showGallery ? '− ' : '+ '}{t('profile.images')}
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
  );
}
