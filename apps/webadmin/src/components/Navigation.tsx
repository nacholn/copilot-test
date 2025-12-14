'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout, getSession } from '../lib/auth';
import styles from './Navigation.module.css';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const session = getSession();

  // Don't show navigation on login page
  if (pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        <h1 className={styles.logo}>WebAdmin</h1>
        <div className={styles.navLinks}>
          <Link 
            href="/" 
            className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            href="/groups" 
            className={`${styles.navLink} ${pathname === '/groups' ? styles.navLinkActive : ''}`}
          >
            Groups
          </Link>
          <Link 
            href="/posts" 
            className={`${styles.navLink} ${pathname === '/posts' ? styles.navLinkActive : ''}`}
          >
            Posts
          </Link>
          <Link 
            href="/users" 
            className={`${styles.navLink} ${pathname === '/users' ? styles.navLinkActive : ''}`}
          >
            Users
          </Link>
          {session && (
            <button
              onClick={handleLogout}
              className={styles.navLink}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginLeft: 'auto',
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
