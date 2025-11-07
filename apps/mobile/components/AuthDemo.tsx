/**
 * AuthDemo Component - Mobile
 * 
 * Authentication demo for React Native mobile app
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { createBrowserClient } from '@cycling-network/config/supabase';
import { Button } from '@cycling-network/ui/native';
import type { User } from '@cycling-network/config/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const AuthDemo: React.FC = () => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const client = createBrowserClient();
    setSupabase(client);

    client.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user as User | null);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as User | null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    if (!supabase) return;
    
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('Signed in successfully!');
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setMessage('Signed out successfully!');
    } catch (error) {
      setMessage('Error signing out');
    } finally {
      setLoading(false);
    }
  };

  if (!supabase) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.userInfo}>Email: {user.email}</Text>
        <Text style={styles.userId}>User ID: {user.id}</Text>
        <Button onPress={handleSignOut} disabled={loading} variant="secondary">
          {loading ? 'Signing out...' : 'Sign Out'}
        </Button>
        {message && <Text style={styles.successMessage}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          autoComplete="password"
        />
      </View>
      <Button onPress={handleSignIn} disabled={loading || !email || !password}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      {message && (
        <Text
          style={[
            styles.message,
            message.startsWith('Error') ? styles.errorMessage : styles.successMessage,
          ]}
        >
          {message}
        </Text>
      )}
      <Text style={styles.hint}>
        Demo: Create an account in your Supabase project to test authentication
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1e293b',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1e293b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  userInfo: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 8,
    color: '#1e293b',
  },
  userId: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#64748b',
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  errorMessage: {
    color: '#dc2626',
  },
  successMessage: {
    color: '#16a34a',
  },
  hint: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b',
  },
});
