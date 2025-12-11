'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        <h1 className={styles.logo}>WebAdmin</h1>
        <div className={styles.navLinks}>
          <Link 
            href="/" 
            className={`${styles.navLink} ${pathname === '/' ? styles.navLinkActive : ''}`}
          >
            Groups
          </Link>
          <Link 
            href="/posts" 
            className={`${styles.navLink} ${pathname === '/posts' ? styles.navLinkActive : ''}`}
          >
            Posts
          </Link>
        </div>
      </div>
    </nav>
  );
}
