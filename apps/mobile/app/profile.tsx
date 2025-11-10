import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Avatar } from '@cyclists/ui';

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // In a real app, we would get the user ID from auth context
        const mockUserId = 'example-user-id';
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Avatar
            name={profile?.city || 'User'}
            imageUri={profile?.avatar}
            size={120}
          />
        </View>

        {profile ? (
          <View style={styles.details}>
            <View style={styles.field}>
              <Text style={styles.label}>Level</Text>
              <Text style={styles.value}>{profile.level}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Bike Type</Text>
              <Text style={styles.value}>{profile.bike_type}</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>City</Text>
              <Text style={styles.value}>{profile.city}</Text>
            </View>

            {profile.bio && (
              <View style={styles.field}>
                <Text style={styles.label}>Bio</Text>
                <Text style={styles.value}>{profile.bio}</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.notFound}>
            Profile not found. Please complete your registration.
          </Text>
        )}

        <Button
          title="Back to Home"
          onPress={() => router.push('/')}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  details: {
    marginBottom: 32,
  },
  field: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#111827',
  },
  notFound: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 32,
  },
});
