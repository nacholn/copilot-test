'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { AuthGuard } from '../../components/AuthGuard';
import { Avatar } from '../../components/Avatar';
import { Loader } from '../../components/Loader';
import type { GroupWithMemberCount } from '@cyclists/config';
import styles from './groups.module.css';

export default function Groups() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [groups, setGroups] = useState<GroupWithMemberCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [showMyGroups, setShowMyGroups] = useState(true);
  const [userGroupIds, setUserGroupIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/groups`);
        const data = await response.json();

        if (data.success) {
          setGroups(data.data);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Fetch user's group memberships
  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/conversations?userId=${user.id}`);
        const data = await response.json();

        if (data.success && data.data.groupConversations) {
          const groupIds = new Set(
            data.data.groupConversations.map((gc: any) => gc.groupId)
          );
          setUserGroupIds(groupIds);
        }
      } catch (error) {
        console.error('Error fetching user groups:', error);
      }
    };

    fetchUserGroups();
  }, [user]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredGroups = groups.filter((group) => {
    // Filter by search query
    if (searchQuery && !group.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by type
    if (typeFilter && group.type !== typeFilter) {
      return false;
    }

    // Filter by city
    if (cityFilter && (!group.city || !group.city.toLowerCase().includes(cityFilter.toLowerCase()))) {
      return false;
    }

    // Filter by my groups
    if (showMyGroups && !userGroupIds.has(group.id)) {
      return false;
    }

    return true;
  });

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>{t('groups.title')}</h1>

          <div className={styles.filters}>
            <input
              type="text"
              placeholder={t('groups.searchGroups')}
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />

            <div className={styles.filterRow}>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={styles.select}
              >
                <option value="">{t('groups.allGroups')}</option>
                <option value="location">{t('groups.location')}</option>
                <option value="general">{t('groups.general')}</option>
              </select>

              <input
                type="text"
                placeholder={t('groups.filterByCity')}
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className={styles.cityInput}
              />

              <button
                className={`${styles.toggleButton} ${showMyGroups ? styles.active : ''}`}
                onClick={() => setShowMyGroups(!showMyGroups)}
              >
                {t('groups.myGroups')}
              </button>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('');
                  setCityFilter('');
                  setShowMyGroups(true);
                }}
                className={styles.clearButton}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <Loader size="large" message={t('common.loading')} />
            </div>
          ) : filteredGroups.length === 0 ? (
            <p className={styles.noResults}>{t('groups.noGroups')}</p>
          ) : (
            <div className={styles.groupList}>
              {filteredGroups.map((group) => (
                <Link key={group.id} href={`/my-groups/${group.id}`} className={styles.groupCard}>
                  <div className={styles.groupImage}>
                    {group.mainImage ? (
                      <img src={group.mainImage} alt={group.name} />
                    ) : (
                      <div className={styles.groupImagePlaceholder}>👥</div>
                    )}
                  </div>
                  <div className={styles.groupInfo}>
                    <div className={styles.groupHeader}>
                      <h3>{group.name}</h3>
                      {userGroupIds.has(group.id) && (
                        <span className={styles.memberBadge}>✓ {t('groups.joined')}</span>
                      )}
                    </div>
                    {group.description && (
                      <p className={styles.groupDescription}>
                        {group.description.length > 100
                          ? group.description.substring(0, 100) + '...'
                          : group.description}
                      </p>
                    )}
                    <div className={styles.groupDetails}>
                      <span className={styles.badge}>{t(`groups.${group.type}`)}</span>
                      {group.city && (
                        <span className={styles.location}>📍 {group.city}</span>
                      )}
                      <span className={styles.memberCount}>
                        {group.memberCount} {group.memberCount === 1 ? t('groups.member') : t('groups.members')}
                      </span>
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
