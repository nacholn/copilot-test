/**
 * AuthDemo Component - Mobile
 * 
 * Authentication demo for React Native mobile app
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from '@cycling-network/ui/native';
import { login, logout, getUser } from '@/lib/auth';

export const AuthDemo: React.FC = () => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check current session on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentUser = await getUser();
    setUser(currentUser);
  };

  const handleSignIn = async () => {
    setLoading(true);
    setMessage('');

    try {
      const authUser = await login(email, password);
      setUser({ id: authUser.id, email: authUser.email });
      setMessage('Signed in successfully!');
      setEmail('');
      setPassword('');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Login failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
      setMessage('Signed out successfully!');
    } catch (error) {
      setMessage('Error signing out');
    } finally {
      setLoading(false);
    }
  };

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
        Demo: Use test@cycling.local / password123 to test authentication
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
