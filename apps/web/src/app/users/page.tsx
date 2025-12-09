'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { AuthGuard } from '../../components/AuthGuard';
import { Avatar } from '../../components/Avatar';
import { Loader } from '../../components/Loader';
import { FilterBikeTypeSelector } from '../../components/FilterBikeTypeSelector';
import { FilterCyclingLevelSelector } from '../../components/FilterCyclingLevelSelector';
import type { Profile, GroupWithDetails } from '@cyclists/config';
import styles from './users.module.css';

type TabType = 'users' | 'groups';

export default function Users() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState<Profile[]>([]);
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [bikeTypeFilter, setBikeTypeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchGroups();
    }
  }, [searchQuery, levelFilter, bikeTypeFilter, cityFilter, locationFilter, user?.id, activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (levelFilter) params.append('level', levelFilter);
      if (bikeTypeFilter) params.append('bikeType', bikeTypeFilter);
      if (cityFilter) params.append('city', cityFilter);

      const response = await fetch(`/api/users?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        // Filter out the current user from the list
        const filteredUsers = data.data.filter((u: Profile) => u.userId !== user?.id);
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('userId', user.id);
      if (searchQuery) params.append('query', searchQuery);
      if (locationFilter) params.append('location', locationFilter);

      const response = await fetch(`/api/groups?${params.toString()}`);
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery('');
    setLevelFilter('');
    setBikeTypeFilter('');
    setCityFilter('');
    setLocationFilter('');
  };

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>{t('users.title')}</h1>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
              onClick={() => handleTabChange('users')}
            >
              {t('users.title')}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'groups' ? styles.activeTab : ''}`}
              onClick={() => handleTabChange('groups')}
            >
              {t('groups.title')}
            </button>
          </div>

          <div className={styles.filters}>
            <input
              type="text"
              placeholder={
                activeTab === 'users' ? t('users.searchPlaceholder') : t('groups.searchGroups')
              }
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            {activeTab === 'users' ? (
              <div className={styles.filterRow}>
                <FilterCyclingLevelSelector
                  value={levelFilter}
                  onChange={setLevelFilter}
                  placeholder={t('users.allLevels')}
                  className={styles.select}
                />

                <FilterBikeTypeSelector
                  value={bikeTypeFilter}
                  onChange={setBikeTypeFilter}
                  placeholder={t('users.allBikeTypes')}
                  className={styles.select}
                />

                <input
                  type="text"
                  placeholder={t('users.filterByCity')}
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className={styles.cityInput}
                />

                <button
                  onClick={() => {
                    setSearchQuery('');
                    setLevelFilter('');
                    setBikeTypeFilter('');
                    setCityFilter('');
                  }}
                  className={styles.clearButton}
                >
                  {t('common.cancel')}
                </button>
              </div>
            ) : (
              <div className={styles.filterRow}>
                <input
                  type="text"
                  placeholder={t('groups.filterByLocation')}
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className={styles.cityInput}
                />
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setLocationFilter('');
                  }}
                  className={styles.clearButton}
                >
                  {t('common.cancel')}
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <Loader size="large" message={t('common.loading')} />
            </div>
          ) : activeTab === 'users' ? (
            users.length === 0 ? (
              <p className={styles.noResults}>{t('users.noUsersFound')}</p>
            ) : (
              <div className={styles.userList}>
                {users.map((user) => (
                  <Link
                    key={user.userId}
                    href={`/users/${user.userId}`}
                    className={styles.userCard}
                  >
                    <Avatar src={user.avatar} name={user.name} size="medium" />
                    <div className={styles.userInfo}>
                      <h3>{user.name}</h3>
                      <p className={styles.userEmail}>{user.email}</p>
                      <div className={styles.userDetails}>
                        <span className={styles.badge}>{user.level}</span>
                        <span className={styles.badge}>{user.bikeType}</span>
                        <span className={styles.location}>📍 {user.city}</span>
                      </div>
                      {user.bio && <p className={styles.userBio}>{user.bio.substring(0, 100)}...</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : groups.length === 0 ? (
            <p className={styles.noResults}>{t('groups.noGroups')}</p>
          ) : (
            <div className={styles.userList}>
              {groups.map((group) => (
                <Link key={group.id} href={`/groups/${group.id}`} className={styles.userCard}>
                  <Avatar src={group.avatar} name={group.name} size="medium" />
                  <div className={styles.userInfo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3>{group.name}</h3>
                      {group.isMember && (
                        <span className={styles.badge} style={{ background: '#28a745' }}>
                          {t('groups.joined')}
                        </span>
                      )}
                    </div>
                    {group.description && (
                      <p className={styles.userBio}>
                        {group.description.length > 100
                          ? group.description.substring(0, 100) + '...'
                          : group.description}
                      </p>
                    )}
                    <div className={styles.userDetails}>
                      <span className={styles.badge}>
                        👥 {t('groups.memberCount', { count: group.memberCount })}
                      </span>
                      {group.location && (
                        <span className={styles.location}>
                          📍{' '}
                          {group.location === 'general' ? t('groups.general') : group.location}
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
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
