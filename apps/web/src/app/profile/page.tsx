'use client';

import { useEffect, useState } from 'react';
import styles from './profile.module.css';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would get the user ID from auth context
    const mockUserId = 'example-user-id';
    
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/profile?userId=${mockUserId}`);
        const data = await response.json();
        
        if (data.success) {
          setProfile(data.data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Your Profile</h1>
        
        <div className={styles.avatar}>
          <div className={styles.avatarPlaceholder}>
            <span>👤</span>
          </div>
        </div>

        {profile ? (
          <div className={styles.details}>
            <div className={styles.field}>
              <strong>Level:</strong> {profile.level}
            </div>
            <div className={styles.field}>
              <strong>Bike Type:</strong> {profile.bike_type}
            </div>
            <div className={styles.field}>
              <strong>City:</strong> {profile.city}
            </div>
            {profile.bio && (
              <div className={styles.field}>
                <strong>Bio:</strong> {profile.bio}
              </div>
            )}
          </div>
        ) : (
          <p>Profile not found. Please complete your registration.</p>
        )}

        <div className={styles.actions}>
          <a href="/" className={styles.button}>Back to Home</a>
        </div>
      </div>
    </main>
  );
}
