'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useRouter } from 'next/navigation';
import { useTranslations } from '../hooks/useTranslations';
import { LanguageSelector } from './LanguageSelector';
import { AuthModal } from './AuthModal';
import Swal from 'sweetalert2';
import styles from './header.module.css';

type AuthModalMode = 'login' | 'register';

export function Header() {
  const { user, signOut } = useAuth();
  const { unreadNotificationCount } = useWebSocket();
  const router = useRouter();
  const { t } = useTranslations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');

  const openAuthModal = (mode: AuthModalMode) => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    closeMenu();
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleSignOut = async () => {
    const result = await Swal.fire({
      title: t('common.signOutTitle'),
      text: t('common.signOutText'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FE3C72',
      cancelButtonColor: '#6c757d',
      confirmButtonText: t('common.yesSignOut'),
      cancelButtonText: t('common.cancel'),
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
        title: t('common.signedOutTitle'),
        text: t('common.signedOutText'),
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
              <Link href="/my-groups" className={styles.navLink} onClick={closeMenu}>
                {t('navigation.myGroups')}
              </Link>
              <Link href="/groups" className={styles.navLink} onClick={closeMenu}>
                {t('navigation.publicGroups')}
              </Link>
              <Link href="/my-posts" className={styles.navLink} onClick={closeMenu}>
                {t('navigation.myPosts')}
              </Link>
              <Link href="/posts" className={styles.navLink} onClick={closeMenu}>
                {t('navigation.publicPosts')}
              </Link>
              <Link href="/my-friends" className={styles.navLink} onClick={closeMenu}>
                {t('navigation.friends')}
              </Link>
              <Link href="/chat" className={styles.navLink} onClick={closeMenu}>
                {t('navigation.chat')}
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
              <Link href="/groups" className={styles.navLink} onClick={closeMenu}>
                {t('navigation.publicGroups')}
              </Link>
              <Link href="/posts" className={styles.navLink} onClick={closeMenu}>
                {t('navigation.publicPosts')}
              </Link>
              <button className={styles.loginButton} onClick={() => openAuthModal('login')}>
                {t('navigation.login')}
              </button>
              <button className={styles.signupButton} onClick={() => openAuthModal('register')}>
                {t('navigation.signUp')}
              </button>
            </>
          )}
        </nav>
        {/* Overlay for mobile menu */}
        {isMenuOpen && <div className={styles.overlay} onClick={closeMenu}></div>}
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} initialMode={authModalMode} />
    </header>
  );
}
