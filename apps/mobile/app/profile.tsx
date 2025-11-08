/**
 * Profile Screen - Mobile Version
 * 
 * Displays and allows editing of the current user's cyclist profile
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { createBrowserClient } from '@cycling-network/config/supabase';
import { ProfileForm } from '@/components/ProfileForm';
import { Button } from '@cycling-network/ui/native';
import type { CyclistProfile, UpdateCyclistProfileRequest } from '@cycling-network/config/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export default function ProfileScreen() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [profile, setProfile] = useState<CyclistProfile | null>(null);
  const [loading, setLoading] = useState(true);
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
      // In a real app, you'd need to configure your API URL
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/profiles/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
      } else if (response.status === 404) {
        // Profile not found - this is okay
        setProfile(null);
      } else {
        Alert.alert('Error', 'Failed to load profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      Alert.alert('Error', 'Failed to load profile. Check your network connection.');
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

    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

    const response = await fetch(`${apiUrl}/api/profiles/me`, {
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
      <View style={styles.centerContainer}>
        <Text style={styles.centerText}>Loading profile...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Please sign in to view and edit your cyclist profile.
        </Text>
        <Button variant="primary" onPress={() => {}}>
          Go to Home
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {profile && (
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri: profile.photoUrl || 'https://ui-avatars.com/api/?name=?&background=2563eb&color=fff&size=200',
            }}
            style={styles.avatar}
          />
          <Text style={styles.email}>{profile.email}</Text>
          {profile.city && (
            <Text style={styles.info}>📍 {profile.city}</Text>
          )}
          {profile.level && (
            <Text style={styles.info}>
              🚴 {profile.level.charAt(0).toUpperCase() + profile.level.slice(1)}
            </Text>
          )}
        </View>
      )}

      <View style={styles.formContainer}>
        <ProfileForm profile={profile} onSave={handleSaveProfile} loading={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  centerText: {
    fontSize: 18,
    color: '#64748b',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  profileHeader: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  email: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1e293b',
  },
  info: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 24,
  },
});
