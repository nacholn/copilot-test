'use client';

import { useState } from 'react';
import type { SupportedLanguage, MultilingualText } from '@cyclists/config';
import styles from './CreateMultilingualPostForm.module.css';

const LANGUAGES: { code: SupportedLanguage; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
];

export function CreateMultilingualPostForm() {
  const [titles, setTitles] = useState<MultilingualText>({});
  const [contents, setContents] = useState<MultilingualText>({});
  const [defaultLanguage, setDefaultLanguage] = useState<SupportedLanguage>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Remove empty translations
      const title = Object.fromEntries(
        Object.entries(titles).filter(([_, v]) => v && v.trim() !== '')
      ) as MultilingualText;

      const content = Object.fromEntries(
        Object.entries(contents).filter(([_, v]) => v && v.trim() !== '')
      ) as MultilingualText;

      const response = await fetch('/api/multilingual-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          default_language: defaultLanguage,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create post');
      }

      // Reset form
      setTitles({});
      setContents({});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.formTitle}>Create Multilingual Post</h2>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>Post created successfully!</div>}

      <div className={styles.defaultLanguageSelector}>
        <label htmlFor="default-language">Default Language:</label>
        <select
          id="default-language"
          value={defaultLanguage}
          onChange={(e) => setDefaultLanguage(e.target.value as SupportedLanguage)}
          className={styles.select}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {LANGUAGES.map((lang) => (
        <div key={lang.code} className={styles.languageSection}>
          <h3 className={styles.languageName}>{lang.name}</h3>

          <div className={styles.formGroup}>
            <label htmlFor={`title-${lang.code}`}>Title ({lang.name}):</label>
            <input
              id={`title-${lang.code}`}
              type="text"
              placeholder={`Enter title in ${lang.name}`}
              value={titles[lang.code] || ''}
              onChange={(e) => setTitles({ ...titles, [lang.code]: e.target.value })}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={`content-${lang.code}`}>Content ({lang.name}):</label>
            <textarea
              id={`content-${lang.code}`}
              placeholder={`Enter content in ${lang.name}`}
              value={contents[lang.code] || ''}
              onChange={(e) => setContents({ ...contents, [lang.code]: e.target.value })}
              rows={5}
              className={styles.textarea}
            />
          </div>
        </div>
      ))}

      <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
        {isSubmitting ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
