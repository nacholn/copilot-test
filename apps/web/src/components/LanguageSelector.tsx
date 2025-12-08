'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './language-selector.module.css';

type Locale = 'en' | 'es' | 'fr';

interface Language {
  code: Locale;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export function LanguageSelector() {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectLanguage = (language: Language) => {
    setLocale(language.code);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDropdown();
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleOptionKeyDown = (event: React.KeyboardEvent, language: Language) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectLanguage(language);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.languageSelector} ref={dropdownRef}>
      <div
        className={`${styles.dropdown} ${isOpen ? styles.open : ''}`}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current language: ${currentLanguage.name}. Click to change language.`}
      >
        <div className={styles.selected}>
          <span className={styles.flagIcon} aria-hidden="true">
            {currentLanguage.flag}
          </span>
          <span className={styles.languageName}>{currentLanguage.name}</span>
          <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`} aria-hidden="true">
            ▼
          </span>
        </div>

        {isOpen && (
          <div className={styles.dropdownMenu} role="listbox">
            {languages.map((language) => (
              <div
                key={language.code}
                className={`${styles.option} ${
                  language.code === locale ? styles.optionSelected : ''
                }`}
                onClick={() => selectLanguage(language)}
                onKeyDown={(e) => handleOptionKeyDown(e, language)}
                tabIndex={0}
                role="option"
                aria-selected={language.code === locale}
                aria-label={`Select ${language.name}`}
              >
                <span className={styles.flagIcon} aria-hidden="true">
                  {language.flag}
                </span>
                <span className={styles.languageName}>{language.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
