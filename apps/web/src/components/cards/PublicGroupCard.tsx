'use client';

import Link from 'next/link';
import type { GroupWithMemberCount } from '@cyclists/config';
import styles from './PublicGroupCard.module.css';

interface PublicGroupCardProps {
  group: GroupWithMemberCount;
}

export function PublicGroupCard({ group }: PublicGroupCardProps) {
  // Use slug if available, otherwise fallback to ID-based URL
  const groupUrl = group.slug ? `/g/${group.slug}` : `/groups/${group.id}`;
  return (
    <Link href={groupUrl} className={styles.card}>
      {group.mainImage && (
        <div className={styles.imageContainer}>
          <img src={group.mainImage} alt={group.name} className={styles.image} />
        </div>
      )}
      <div className={styles.content}>
        <h3 className={styles.title}>{group.name}</h3>
        {group.description && (
          <p className={styles.description}>
            {group.description.length > 100
              ? `${group.description.substring(0, 100)}...`
              : group.description}
          </p>
        )}
        <div className={styles.meta}>
          <span className={styles.type}>
            {group.type === 'location' ? '📍' : '👥'}{' '}
            {group.type === 'location' ? 'Location' : 'General'}
          </span>
          {group.city && <span className={styles.city}>{group.city}</span>}
        </div>
        <div className={styles.members}>
          👤 {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
        </div>
      </div>
    </Link>
  );
}
