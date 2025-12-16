'use client';

import { useLanguage } from '../contexts/LanguageContext';
import en from '../messages/en.json';
import es from '../messages/es.json';
import fr from '../messages/fr.json';

const translations = { en, es, fr };

export function useTranslations() {
  const { locale } = useLanguage();

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, locale };
}
