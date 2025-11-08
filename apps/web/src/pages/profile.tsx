/**
 * Profile Page - Web Version
 * 
 * Displays and allows editing of the current user's cyclist profile
 */

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@cycling-network/config/supabase';
import { ProfileForm } from '@/components/ProfileForm';
import type { CyclistProfile, UpdateCyclistProfileRequest } from '@cycling-network/config/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export default function ProfilePage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [profile, setProfile] = useState<CyclistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const client = createBrowserClient();
    setSupabase(client);

    // Check authentication
    client.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) {
        fetchProfile(client, session.access_token);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchProfile = async (client: SupabaseClient, token: string) => {
    try {
      const response = await fetch('/api/profiles/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
      } else if (response.status === 404) {
        // Profile not found - this is okay, it might not exist yet
        setProfile(null);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (updates: UpdateCyclistProfileRequest) => {
    if (!supabase) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/profiles/me', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const data = await response.json();
    setProfile(data.data);
  };

  if (loading) {
    return (
      <main style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p>Loading profile...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
          Profile
        </h1>
        <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '32px' }}>
          Please sign in to view and edit your cyclist profile.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          Go to Home
        </a>
      </main>
    );
  }

  return (
    <main style={{ padding: '48px 24px', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {profile && (
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '16px',
              marginBottom: '32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <img
              src={profile.photoUrl || 'https://ui-avatars.com/api/?name=?&background=2563eb&color=fff&size=200'}
              alt="Profile"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                {profile.email}
              </h1>
              {profile.city && (
                <p style={{ color: '#64748b', fontSize: '16px' }}>
                  📍 {profile.city}
                </p>
              )}
              {profile.level && (
                <p style={{ color: '#64748b', fontSize: '16px', marginTop: '4px' }}>
                  🚴 {profile.level.charAt(0).toUpperCase() + profile.level.slice(1)}
                </p>
              )}
            </div>
          </div>
        )}

        <div
          style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                borderRadius: '8px',
                marginBottom: '24px',
              }}
            >
              {error}
            </div>
          )}

          <ProfileForm profile={profile} onSave={handleSaveProfile} loading={loading} />
        </div>
      </div>
    </main>
  );
}
