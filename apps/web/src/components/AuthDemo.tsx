/**
 * AuthDemo Component
 * 
 * Demonstrates Supabase authentication integration:
 * - Sign in with email/password
 * - Sign up with email verification
 * - OAuth providers (Google, Apple, Microsoft)
 * - Sign out
 * - Display current user info
 */

import { useState, useEffect } from 'react';
import { Button } from '@cycling-network/ui';
import {
  signInWithPassword,
  signUp,
  signOut,
  signInWithOAuth,
  getUser,
  onAuthStateChange,
} from '@/lib/auth';
import type { User } from '@cycling-network/config/types';

export const AuthDemo: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    // Load current session
    getUser().then(setUser);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
    });

    return () => unsubscribe();
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        await signUp(email, password);
        setMessage('Check your email to verify your account!');
      } else {
        await signInWithPassword(email, password);
        setMessage('Signed in successfully!');
      }
      setEmail('');
      setPassword('');
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Authentication failed'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple' | 'azure') => {
    setLoading(true);
    setMessage('');

    try {
      await signInWithOAuth(provider);
      // Note: OAuth redirects, so this won't execute
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'OAuth failed'}`);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setMessage('Signed out successfully!');
    } catch (error) {
      setMessage('Error signing out');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2>Welcome!</h2>
        <p style={{ margin: '16px 0' }}>Email: {user.email}</p>
        <p style={{ margin: '16px 0', fontSize: '14px', color: '#64748b' }}>
          User ID: {user.id}
        </p>
        <Button onClick={handleSignOut} disabled={loading} variant="secondary">
          {loading ? 'Signing out...' : 'Sign Out'}
        </Button>
        {message && (
          <p style={{ marginTop: '16px', color: '#16a34a' }}>{message}</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </h2>
      
      {/* Email/Password Form */}
      <form onSubmit={handleEmailAuth}>
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="email"
            style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px',
            }}
          />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="password"
            style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '16px',
            }}
          />
        </div>
        <Button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? (isSignUp ? 'Signing up...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
        </Button>
      </form>

      {/* Toggle Sign In/Sign Up */}
      <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage('');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>

      {/* OAuth Providers */}
      <div style={{ marginTop: '24px' }}>
        <p style={{ textAlign: 'center', marginBottom: '16px', fontSize: '14px', color: '#64748b' }}>
          Or continue with
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Button
            onClick={() => handleOAuthSignIn('google')}
            disabled={loading}
            variant="secondary"
            style={{ width: '100%' }}
          >
            Continue with Google
          </Button>
          <Button
            onClick={() => handleOAuthSignIn('apple')}
            disabled={loading}
            variant="secondary"
            style={{ width: '100%' }}
          >
            Continue with Apple
          </Button>
          <Button
            onClick={() => handleOAuthSignIn('azure')}
            disabled={loading}
            variant="secondary"
            style={{ width: '100%' }}
          >
            Continue with Microsoft
          </Button>
        </div>
      </div>

      {message && (
        <p
          style={{
            marginTop: '16px',
            textAlign: 'center',
            color: message.startsWith('Error') ? '#dc2626' : '#16a34a',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};
