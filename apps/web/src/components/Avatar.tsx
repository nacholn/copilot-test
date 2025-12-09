'use client';

import Image from 'next/image';
import styles from './avatar.module.css';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
}

export function Avatar({ src, name, size = 'medium', className }: AvatarProps) {
  const safeName = name || 'Unknown User';

  const getInitials = (name: string): string => {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(safeName);

  // Generate a consistent color based on the name
  const getColorFromName = (name: string): string => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E2',
      '#F8B739',
      '#52B788',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  const backgroundColor = getColorFromName(safeName);

  return (
    <div className={`${styles.avatar} ${styles[size]} ${className || ''}`}>
      {' '}
      {src ? (
        <Image src={src} alt={safeName} className={styles.image} width={48} height={48} />
      ) : (
        <div className={styles.initials} style={{ backgroundColor }}>
          {initials}
        </div>
      )}
    </div>
  );
}
