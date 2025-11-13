'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/common.module.css';
import { API_URL, type Profile } from '@cyclists/config';
import { useAuth } from '../../contexts/AuthContext';
import { AuthGuard } from '../../components/AuthGuard';
import { ProfileForm } from '../../components/ProfileForm';

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
        <main className={styles.main}>
          <div className={styles.container}>
            <p>Loading profile...</p>
          </div>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Your Profile</h1>

          {editing ? (
            <div>
              <h2 className={styles.title} style={{ fontSize: '1.5rem' }}>Edit Profile</h2>
              <ProfileForm initialProfile={profile} onSave={handleProfileSave} />
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  onClick={() => setEditing(false)}
                  className={styles.secondaryButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : profile ? (
            <>
              <div className={styles.avatar}>
                <div className={styles.avatarPlaceholder}>
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Profile" />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
              </div>

              <div>
                <div className={styles.infoField}>
                  <strong>Level:</strong> {profile.level}
                </div>
                <div className={styles.infoField}>
                  <strong>Bike Type:</strong> {profile.bikeType}
                </div>
                <div className={styles.infoField}>
                  <strong>City:</strong> {profile.city}
                </div>
                {profile.dateOfBirth && (
                  <div className={styles.infoField}>
                    <strong>Date of Birth:</strong>{' '}
                    {new Date(profile.dateOfBirth).toLocaleDateString()}
                  </div>
                )}
                {profile.bio && (
                  <div className={styles.infoField}>
                    <strong>Bio:</strong> {profile.bio}
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                <button onClick={() => setEditing(true)} className={styles.primaryButton}>
                  Edit Profile
                </button>
                <a href="/" className={styles.secondaryButton}>
                  Back to Home
                </a>
                <button onClick={handleSignOut} className={styles.secondaryButton}>
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
