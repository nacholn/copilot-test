'use client';

import { useLanguage } from '../contexts/LanguageContext';
import { useTranslations } from '../hooks/useTranslations';
import styles from './language-selector.module.css';

const languages = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'es', flag: '🇪🇸' },
  { code: 'fr', flag: '🇫🇷' },
] as const;

export function LanguageSelector() {
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslations();

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  return (
    <div className={styles.languageSelector}>
      <span className={styles.flagIcon}>{currentLanguage.flag}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as 'en' | 'es' | 'fr')}
        className={styles.select}
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {t(`languages.${lang.code}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
