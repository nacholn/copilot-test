import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '@bicicita/ui';
import { StatusBar } from 'expo-status-bar';

export default function Home() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.emoji}>🚴</Text>
        <Text style={styles.title}>Cyclists Social Network</Text>
        <Text style={styles.description}>
          Connect with fellow cyclists, share routes, and build your cycling community
        </Text>

        <View style={styles.buttons}>
          <Link href="/register" asChild>
            <View>
              <Button title="Get Started" onPress={() => {}} variant="primary" />
            </View>
          </Link>
          <Link href="/login" asChild>
            <View>
              <Button title="Sign In" onPress={() => {}} variant="secondary" />
            </View>
          </Link>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>🗺️</Text>
            <Text style={styles.featureTitle}>Discover Routes</Text>
            <Text style={styles.featureText}>Find the best cycling routes in your area</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>👥</Text>
            <Text style={styles.featureTitle}>Connect</Text>
            <Text style={styles.featureText}>Meet cyclists with similar interests</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>📊</Text>
            <Text style={styles.featureTitle}>Track Progress</Text>
            <Text style={styles.featureText}>Monitor your cycling journey</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  buttons: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  features: {
    width: '100%',
    gap: 16,
  },
  feature: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
});
