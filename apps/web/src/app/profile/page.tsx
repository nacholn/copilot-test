'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './profile.module.css';
import commonStyles from '../../styles/common.module.css';
import { API_URL, type Profile } from '@cyclists/config';
import { useAuth } from '../../contexts/AuthContext';
import { AuthGuard } from '../../components/AuthGuard';
import { ProfileForm } from '../../components/ProfileForm';
import { Avatar } from '../../components/Avatar';
import { Loader } from '../../components/Loader';

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

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
        <Loader fullScreen message="Loading profile..." />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className={commonStyles.main}>
        <div className={commonStyles.container}>
          <h1 className={commonStyles.title}>Your Profile</h1>

          {editing ? (
            <div className={styles.editContainer}>
              <h2 className={commonStyles.title} style={{ fontSize: '1.5rem' }}>Edit Profile</h2>
              <ProfileForm initialProfile={profile} onSave={handleProfileSave} />
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  onClick={() => setEditing(false)}
                  className={commonStyles.secondaryButton}
                >
                  Cancel
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
                  <strong>Name:</strong> {profile.name}
                </div>
                <div className={commonStyles.field}>
                  <strong>Email:</strong> {profile.email}
                </div>
                <div className={commonStyles.field}>
                  <strong>Level:</strong> {profile.level}
                </div>
                <div className={commonStyles.infoField}>
                  <strong>Bike Type:</strong> {profile.bikeType}
                </div>
                <div className={commonStyles.infoField}>
                  <strong>City:</strong> {profile.city}
                </div>
                {profile.dateOfBirth && (
                  <div className={commonStyles.infoField}>
                    <strong>Date of Birth:</strong>{' '}
                    {new Date(profile.dateOfBirth).toLocaleDateString()}
                  </div>
                )}
                {profile.bio && (
                  <div className={commonStyles.infoField}>
                    <strong>Bio:</strong> {profile.bio}
                  </div>
                )}
              </div>

              <div className={commonStyles.actions}>
                <button onClick={() => setEditing(true)} className={commonStyles.primaryButton}>
                  Edit Profile
                </button>
                <a href="/" className={commonStyles.secondaryButton}>
                  Back to Home
                </a>
                <button onClick={handleSignOut} className={commonStyles.secondaryButton}>
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div>
              <p>Welcome! Let&apos;s create your cycling profile.</p>
              <ProfileForm onSave={handleProfileSave} />
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
