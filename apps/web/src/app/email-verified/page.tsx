'use client';

import { useTranslations } from '../../hooks/useTranslations';
import styles from './emailVerified.module.css';

export default function EmailVerified() {
  const { t } = useTranslations();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.icon}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 className={styles.title}>✅ {t('emailVerified.title')}</h1>
        <p className={styles.message}>{t('emailVerified.message')}</p>
        <div className={styles.warning}>
          <p>⚠️ {t('emailVerified.closeTabHint')}</p>
        </div>
      </div>
    </main>
  );
}
