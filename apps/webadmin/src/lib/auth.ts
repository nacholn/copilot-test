/**
 * Authentication utilities for webadmin
 */

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const session = localStorage.getItem('webadmin_session');
  if (!session) return false;

  try {
    const sessionData: Session = JSON.parse(session);
    
    // Check if token exists
    if (!sessionData.access_token) return false;

    // Check if token is expired
    if (sessionData.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (now >= sessionData.expires_at) {
        // Token expired, clear session
        localStorage.removeItem('webadmin_session');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Get current session
 */
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  
  const session = localStorage.getItem('webadmin_session');
  if (!session) return null;

  try {
    return JSON.parse(session);
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Clear session and logout
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('webadmin_session');
}
