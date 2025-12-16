'use client';

import { useState } from 'react';
import type { MultilingualPost, SupportedLanguage } from '@cyclists/config';
import { getLocalizedText } from '@cyclists/config';
import styles from './MultilingualPostCard.module.css';

interface MultilingualPostCardProps {
  post: MultilingualPost;
  userLanguage?: SupportedLanguage;
}

export function MultilingualPostCard({ post, userLanguage = 'en' }: MultilingualPostCardProps) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(userLanguage);

  const title = getLocalizedText(post.title, currentLanguage);
  const content = getLocalizedText(post.content, currentLanguage);

  return (
    <article className={styles.postCard}>
      <div className={styles.languageSwitcher}>
        {post.available_languages.map((lang) => (
          <button
            key={lang}
            onClick={() => setCurrentLanguage(lang)}
            className={currentLanguage === lang ? styles.active : ''}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      <h2 className={styles.title}>{title}</h2>
      <p className={styles.content}>{content}</p>

      <div className={styles.postMeta}>
        <small>Default language: {post.default_language}</small>
      </div>
    </article>
  );
}
