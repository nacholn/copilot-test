import { describe, it, expect } from 'vitest';
import {
  getLocalizedText,
  hasTranslation,
  getAvailableLanguages,
  validateMultilingualText,
} from '../i18n';
import type { MultilingualText } from '../../types';

describe('i18n utilities', () => {
  describe('getLocalizedText', () => {
    it('should return text in preferred language', () => {
      const text: MultilingualText = {
        en: 'Hello',
        es: 'Hola',
        fr: 'Bonjour',
      };
      expect(getLocalizedText(text, 'es')).toBe('Hola');
    });

    it('should fallback to default language when preferred is not available', () => {
      const text: MultilingualText = {
        en: 'Hello',
        fr: 'Bonjour',
      };
      expect(getLocalizedText(text, 'es')).toBe('Hello');
    });

    it('should fallback to custom fallback language', () => {
      const text: MultilingualText = {
        es: 'Hola',
        fr: 'Bonjour',
      };
      expect(getLocalizedText(text, 'en', 'fr')).toBe('Bonjour');
    });

    it('should return first available language if no fallback exists', () => {
      const text: MultilingualText = {
        fr: 'Bonjour',
      };
      expect(getLocalizedText(text, 'es', 'en')).toBe('Bonjour');
    });

    it('should return empty string for empty object', () => {
      const text: MultilingualText = {};
      expect(getLocalizedText(text, 'en')).toBe('');
    });
  });

  describe('hasTranslation', () => {
    it('should return true when language exists', () => {
      const text: MultilingualText = {
        en: 'Hello',
        es: 'Hola',
      };
      expect(hasTranslation(text, 'es')).toBe(true);
    });

    it('should return false when language does not exist', () => {
      const text: MultilingualText = {
        en: 'Hello',
      };
      expect(hasTranslation(text, 'fr')).toBe(false);
    });

    it('should return false for empty string', () => {
      const text: MultilingualText = {
        en: 'Hello',
        es: '',
      };
      expect(hasTranslation(text, 'es')).toBe(false);
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return all languages with content', () => {
      const text: MultilingualText = {
        en: 'Hello',
        es: 'Hola',
        fr: 'Bonjour',
      };
      expect(getAvailableLanguages(text)).toEqual(['en', 'es', 'fr']);
    });

    it('should exclude languages with empty strings', () => {
      const text: MultilingualText = {
        en: 'Hello',
        es: '',
        fr: 'Bonjour',
      };
      expect(getAvailableLanguages(text)).toEqual(['en', 'fr']);
    });

    it('should return empty array for empty object', () => {
      const text: MultilingualText = {};
      expect(getAvailableLanguages(text)).toEqual([]);
    });
  });

  describe('validateMultilingualText', () => {
    it('should return true when at least one language is provided', () => {
      const text: MultilingualText = {
        en: 'Hello',
      };
      expect(validateMultilingualText(text)).toBe(true);
    });

    it('should return false for empty object', () => {
      const text: MultilingualText = {};
      expect(validateMultilingualText(text)).toBe(false);
    });

    it('should return false when all languages are empty strings', () => {
      const text: MultilingualText = {
        en: '',
        es: '',
      };
      expect(validateMultilingualText(text)).toBe(false);
    });

    it('should return true when at least one non-empty language exists', () => {
      const text: MultilingualText = {
        en: '',
        es: 'Hola',
        fr: '',
      };
      expect(validateMultilingualText(text)).toBe(true);
    });
  });
});
