'use client';

import styles from './loader.module.css';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  message?: string;
}

export function Loader({ size = 'medium', fullScreen = false, message }: LoaderProps) {
  const content = (
    <div className={styles.loaderContainer}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className={styles.fullScreen}>{content}</div>;
  }

  return content;
}
