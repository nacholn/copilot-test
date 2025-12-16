import type { MultilingualText, SupportedLanguage } from '../types';

/**
 * Get text in preferred language with fallback
 */
export function getLocalizedText(
  text: MultilingualText,
  preferredLanguage: SupportedLanguage,
  fallbackLanguage: SupportedLanguage = 'en'
): string {
  return text[preferredLanguage] || text[fallbackLanguage] || Object.values(text)[0] || '';
}

/**
 * Check if text has translation for a language
 */
export function hasTranslation(text: MultilingualText, language: SupportedLanguage): boolean {
  return !!text[language];
}

/**
 * Get all available languages for a multilingual text
 */
export function getAvailableLanguages(text: MultilingualText): SupportedLanguage[] {
  return Object.keys(text).filter((key) => text[key as SupportedLanguage]) as SupportedLanguage[];
}

/**
 * Validate that at least one language is provided
 */
export function validateMultilingualText(text: MultilingualText): boolean {
  return getAvailableLanguages(text).length > 0;
}
