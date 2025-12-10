'use client';

import Link from 'next/link';
import { Avatar } from './Avatar';
import { useTranslations } from '../hooks/useTranslations';
import type { GroupWithDetails } from '@cyclists/config';
import styles from './group-card.module.css';

interface GroupCardProps {
  group: GroupWithDetails;
  showActions?: boolean;
  onJoin?: (groupId: string) => void;
  onLeave?: (groupId: string) => void;
  loading?: boolean;
}

export function GroupCard({ group, showActions = true, onJoin, onLeave, loading = false }: GroupCardProps) {
  const { t } = useTranslations();

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (group.isMember && onLeave) {
      onLeave(group.id);
    } else if (!group.isMember && onJoin) {
      onJoin(group.id);
    }
  };

  return (
    <Link href={`/groups/${group.id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        {group.mainImage ? (
          <img src={group.mainImage} alt={group.name} className={styles.image} />
        ) : (
          <div className={styles.placeholderImage}>
            <span className={styles.placeholderEmoji}>👥</span>
          </div>
        )}
        <div className={styles.typeBadge}>
          <span className={styles.typeBadgeText}>
            {group.type === 'location' ? '📍' : '🌍'} {group.type === 'location' ? t('groups.locationBased') : t('groups.general')}
          </span>
        </div>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.name}>{group.name}</h3>
        
        {group.description && (
          <p className={styles.description}>
            {group.description.length > 100 ? `${group.description.substring(0, 100)}...` : group.description}
          </p>
        )}

        {group.city && (
          <p className={styles.location}>📍 {group.city}</p>
        )}

        <div className={styles.meta}>
          <span className={styles.members}>
            {group.memberCount} {group.memberCount === 1 ? t('groups.member') : t('groups.members')}
          </span>
          {group.unreadCount !== undefined && group.unreadCount > 0 && (
            <span className={styles.unread}>
              {group.unreadCount} {t('groups.unreadMessages')}
            </span>
          )}
        </div>

        {group.creatorName && (
          <p className={styles.creator}>
            {t('groups.createdBy')} {group.creatorName}
          </p>
        )}

        {showActions && (
          <button
            onClick={handleAction}
            className={`${styles.actionButton} ${group.isMember ? styles.leaveButton : styles.joinButton}`}
            disabled={loading}
          >
            {loading ? '...' : group.isMember ? t('groups.leaveGroup') : t('groups.joinGroup')}
          </button>
        )}
      </div>
    </Link>
  );
}
