/**
 * Home Screen - Mobile App
 * 
 * Main screen for the React Native mobile app
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@cycling-network/ui/native';
import { AuthDemo } from '@/components/AuthDemo';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cycling Network Platform</Text>
        <Text style={styles.subtitle}>Mobile App (Expo React Native)</Text>
        <View style={styles.buttonContainer}>
          <Button variant="primary" onPress={() => router.push('/profile')}>
            My Profile
          </Button>
          <Button variant="secondary" onPress={() => console.log('Learn More')}>
            Learn More
          </Button>
        </View>
      </View>

      <View style={styles.card}>
        <AuthDemo />
      </View>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Features</Text>
        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text style={styles.featureTitle}>Native Mobile</Text>
            <Text style={styles.featureDescription}>
              Built with React Native & Expo
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔐</Text>
            <Text style={styles.featureTitle}>Secure Auth</Text>
            <Text style={styles.featureDescription}>
              Supabase authentication
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎨</Text>
            <Text style={styles.featureTitle}>Shared UI</Text>
            <Text style={styles.featureDescription}>
              Consistent design system
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2563eb',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  features: {
    padding: 24,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1e293b',
  },
  featureGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1e293b',
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
