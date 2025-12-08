'use client';

import { useLanguage } from '../contexts/LanguageContext';
import styles from './language-selector.module.css';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
] as const;

export function LanguageSelector() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className={styles.languageSelector}>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as 'en' | 'es' | 'fr')}
        className={styles.select}
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
