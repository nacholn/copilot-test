'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { AuthGuard } from '../../components/AuthGuard';
import { Avatar } from '../../components/Avatar';
import { Loader } from '../../components/Loader';
import type { GroupWithDetails } from '@cyclists/config';
import styles from './groups.module.css';

export default function Groups() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [myGroups, setMyGroups] = useState<GroupWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyGroups = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/groups/my-groups?userId=${user.id}`);
        const data = await response.json();

        if (data.success) {
          setMyGroups(data.data);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyGroups();
  }, [user]);

  if (loading) {
    return (
      <AuthGuard>
        <Loader fullScreen message={t('groups.loading')} />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>{t('groups.myGroups')}</h1>
            <Link href="/groups/create" className={styles.createButton}>
              {t('groups.createGroup')}
            </Link>
          </div>

          {myGroups.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{t('groups.noMyGroups')}</p>
              <p>{t('groups.createFirst')}</p>
              <div className={styles.emptyActions}>
                <Link href="/groups/create" className={styles.primaryButton}>
                  {t('groups.createGroup')}
                </Link>
                <Link href="/users" className={styles.secondaryButton}>
                  {t('groups.discoverGroups')}
                </Link>
              </div>
            </div>
          ) : (
            <div className={styles.groupList}>
              {myGroups.map((group) => (
                <Link key={group.id} href={`/groups/${group.id}`} className={styles.groupCard}>
                  <Avatar src={group.avatar} name={group.name} size="large" />
                  <div className={styles.groupInfo}>
                    <div className={styles.groupHeader}>
                      <h3>{group.name}</h3>
                      {group.isAdmin && <span className={styles.adminBadge}>{t('groups.admin')}</span>}
                    </div>
                    {group.description && (
                      <p className={styles.groupDescription}>
                        {group.description.length > 100
                          ? group.description.substring(0, 100) + '...'
                          : group.description}
                      </p>
                    )}
                    <div className={styles.groupMeta}>
                      <span className={styles.memberCount}>
                        👥 {group.memberCount} {t('groups.memberCount')}
                      </span>
                      {group.location && (
                        <span className={styles.location}>
                          📍 {group.location === 'general' ? t('groups.general') : group.location}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            <Link href="/" className={styles.backButton}>
              {t('common.back')}
            </Link>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
