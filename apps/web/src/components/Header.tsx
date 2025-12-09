'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useRouter } from 'next/navigation';
import { useTranslations } from '../hooks/useTranslations';
import { LanguageSelector } from './LanguageSelector';
import Swal from 'sweetalert2';
import styles from './header.module.css';

export function Header() {
  const { user, signOut } = useAuth();
  const { unreadNotificationCount } = useWebSocket();
  const router = useRouter();
  const { t } = useTranslations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const result = await Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to sign out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FE3C72',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, sign out',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: styles.swalPopup,
        title: styles.swalTitle,
        confirmButton: styles.swalConfirm,
        cancelButton: styles.swalCancel,
      },
    });

    if (result.isConfirmed) {
      await signOut();
      setIsMenuOpen(false);
      router.push('/');

      Swal.fire({
        title: 'Signed Out!',
        text: 'You have been successfully signed out.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: styles.swalPopup,
          title: styles.swalTitle,
        },
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <span className={styles.logoIcon}>🚴</span>
          <span className={styles.logoText}>Cyclists</span>
        </Link>{' '}
        {/* Language Selector */}
        <div className={styles.languageWrapper}>
          <LanguageSelector />
        </div>
        {/* Hamburger button for mobile */}
        <button
          className={`${styles.hamburger} ${isMenuOpen ? styles.hamburgerActive : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        {/* Navigation - Desktop and Mobile */}
        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          {user ? (
            <>
              <Link href="/users" className={styles.navLink} onClick={closeMenu}>
                {t('navigation.discover')}
              </Link>
              <Link href="/friends" className={styles.navLink} onClick={closeMenu}>
                {t('navigation.friends')}
              </Link>
              <Link href="/friend-requests" className={styles.navLink} onClick={closeMenu}>
                {t('navigation.requests')}
              </Link>
              <Link href="/chat" className={styles.navLink} onClick={closeMenu}>
                {t('navigation.chat')}
              </Link>
              <Link href="/posts" className={styles.navLink} onClick={closeMenu}>
                {t('navigation.posts')}
              </Link>
              <Link
                href="/notifications"
                className={styles.navLinkNotifications}
                onClick={closeMenu}
              >
                <span>🔔</span>
                {unreadNotificationCount > 0 && (
                  <span className={styles.notificationBadge}>{unreadNotificationCount}</span>
                )}
              </Link>
              <Link href="/profile" className={styles.navLink} onClick={closeMenu}>
                {t('navigation.profile')}
              </Link>
              <button onClick={handleSignOut} className={styles.logoutButton}>
                {t('navigation.logout')}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.loginButton} onClick={closeMenu}>
                {t('navigation.login')}
              </Link>
              <Link href="/register" className={styles.signupButton} onClick={closeMenu}>
                {t('navigation.signUp')}
              </Link>
            </>
          )}
        </nav>
        {/* Overlay for mobile menu */}
        {isMenuOpen && <div className={styles.overlay} onClick={closeMenu}></div>}
      </div>
    </header>
  );
}
