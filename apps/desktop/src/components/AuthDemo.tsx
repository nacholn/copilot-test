/**
 * AuthDemo Component - Desktop
 * 
 * Authentication demo for desktop app (reuses web logic)
 * Same functionality as web version
 */

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@cycling-network/config/supabase';
import { Button } from '@cycling-network/ui';
import type { User } from '@cycling-network/config/types';

const supabase = createBrowserClient();

export const AuthDemo: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user as User | null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as User | null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Sign In</h2>
      <form onSubmit={handleSignIn}>
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
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
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
