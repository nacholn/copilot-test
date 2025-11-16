'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './header.module.css';

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🚴</span>
          <span className={styles.logoText}>Cyclists</span>
        </Link>
        
        <nav className={styles.nav}>
          {user ? (
            <>
              <Link href="/users" className={styles.navLink}>
                Discover
              </Link>
              <Link href="/friends" className={styles.navLink}>
                Friends
              </Link>
              <Link href="/profile" className={styles.navLink}>
                Profile
              </Link>
              <button onClick={handleSignOut} className={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.loginButton}>
                Login
              </Link>
              <Link href="/register" className={styles.signupButton}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
