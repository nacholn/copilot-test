'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { AuthGuard } from '../../components/AuthGuard';
import { Avatar } from '../../components/Avatar';
import { Loader } from '../../components/Loader';
import { FilterBikeTypeSelector } from '../../components/FilterBikeTypeSelector';
import { FilterCyclingLevelSelector } from '../../components/FilterCyclingLevelSelector';
import type { Profile, GroupWithMemberCount, GroupConversation } from '@cyclists/config';
import styles from './users.module.css';

type TabType = 'users' | 'groups';

function UsersInner() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [users, setUsers] = useState<Profile[]>([]);
  const [groups, setGroups] = useState<GroupWithMemberCount[]>([]);
  const [userGroupIds, setUserGroupIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [bikeTypeFilter, setBikeTypeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showMyGroups, setShowMyGroups] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  // Fetch current user's profile to get location
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/profile?userId=${user.id}`);
        const data = await response.json();
        if (data.success && data.data) {
          setUserProfile(data.data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  // Extract location for dependency to prevent unnecessary re-fetches
  const userLatitude = userProfile?.latitude;
  const userLongitude = userProfile?.longitude;

  useEffect(() => {
    const fetchUsers = async () => {
      if (activeTab !== 'users') return;

      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchQuery) params.append('query', searchQuery);
        if (nameQuery) params.append('name', nameQuery);
        if (levelFilter) params.append('level', levelFilter);
        if (bikeTypeFilter) params.append('bikeType', bikeTypeFilter);
        if (cityFilter) params.append('city', cityFilter);

        // Add distance filter if set and user has location
        if (distanceFilter !== null && userLatitude && userLongitude) {
          params.append('distance', distanceFilter.toString());
          params.append('userLatitude', userLatitude.toString());
          params.append('userLongitude', userLongitude.toString());
        }

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

    fetchUsers();
  }, [
    searchQuery,
    nameQuery,
    levelFilter,
    bikeTypeFilter,
    cityFilter,
    distanceFilter,
    user?.id,
    activeTab,
    userLatitude,
    userLongitude,
  ]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (activeTab !== 'groups') return;

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
  }, [activeTab]);

  // Fetch user's group memberships
  useEffect(() => {
    const fetchUserGroups = async () => {
      if (!user || activeTab !== 'groups') return;

      try {
        const response = await fetch(`/api/conversations?userId=${user.id}`);
        const data = await response.json();

        if (data.success && data.data.groupConversations) {
          const groupIds: string[] = data.data.groupConversations
            .map((gc: GroupConversation) => String(gc.groupId))
            .filter((id: string) => id.length > 0);
          setUserGroupIds(new Set<string>(groupIds));
        }
      } catch (error) {
        console.error('Error fetching user groups:', error);
      }
    };

    fetchUserGroups();
  }, [user, activeTab]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Reset filters when switching tabs
    setSearchQuery('');
    setNameQuery('');
    setLevelFilter('');
    setBikeTypeFilter('');
    setCityFilter('');
    setTypeFilter('');
    setShowMyGroups(false);
    setDistanceFilter(null);
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value === 0) {
      setDistanceFilter(null); // "All" distances
    } else {
      setDistanceFilter(value);
    }
  };

  const getDistanceLabel = () => {
    if (distanceFilter === null) return t('users.allDistances') || 'All distances';
    return `${distanceFilter} km`;
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
    if (
      cityFilter &&
      (!group.city || !group.city.toLowerCase().includes(cityFilter.toLowerCase()))
    ) {
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
          <h1 className={styles.title}>{t('users.title')}</h1>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
              onClick={() => handleTabChange('users')}
            >
              {t('users.usersTab')}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'groups' ? styles.active : ''}`}
              onClick={() => handleTabChange('groups')}
            >
              {t('users.groupsTab')}
            </button>
          </div>

          {/* Users Tab Content */}
          {activeTab === 'users' && (
            <>
              <div className={styles.filters}>
                <input
                  type="text"
                  placeholder={t('users.searchByName') || 'Search by name...'}
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  className={styles.searchInput}
                />
                <input
                  type="text"
                  placeholder={t('users.searchPlaceholder')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className={styles.searchInput}
                />
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
                      setNameQuery('');
                      setLevelFilter('');
                      setBikeTypeFilter('');
                      setCityFilter('');
                      setDistanceFilter(null);
                    }}
                    className={styles.clearButton}
                  >
                    {t('common.cancel')}
                  </button>
                </div>

                {/* Distance Filter Slider */}
                {userProfile?.latitude && userProfile?.longitude && (
                  <div className={styles.distanceFilter}>
                    <label htmlFor="distance-slider" className={styles.distanceLabel}>
                      {t('users.distanceFilter') || 'Distance'}:{' '}
                      <strong>{getDistanceLabel()}</strong>
                    </label>
                    <input
                      id="distance-slider"
                      type="range"
                      min="0"
                      max="500"
                      step="1"
                      value={distanceFilter ?? 0}
                      onChange={handleDistanceChange}
                      className={styles.distanceSlider}
                    />
                    <div className={styles.distanceMarkers}>
                      <span>{t('users.all') || 'All'}</span>
                      <span>125 km</span>
                      <span>250 km</span>
                      <span>375 km</span>
                      <span>500 km</span>
                    </div>
                  </div>
                )}
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                  <Loader size="large" message={t('common.loading')} />
                </div>
              ) : users.length === 0 ? (
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
                        {user.bio && (
                          <p className={styles.userBio}>{user.bio.substring(0, 100)}...</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Groups Tab Content */}
          {activeTab === 'groups' && (
            <>
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
                      setShowMyGroups(false);
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
                    <Link key={group.id} href={`/groups/${group.id}`} className={styles.groupCard}>
                      <div className={styles.groupImage}>
                        {group.mainImage ? (
                          <Image
                            src={group.mainImage}
                            alt={group.name}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, 300px"
                          />
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
                          {group.city && <span className={styles.location}>📍 {group.city}</span>}
                          <span className={styles.memberCount}>
                            {group.memberCount}{' '}
                            {group.memberCount === 1 ? t('groups.member') : t('groups.members')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
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

export default function Users() {
  return (
    <Suspense fallback={<Loader fullScreen message="Loading users..." />}>
      <UsersInner />
    </Suspense>
  );
}
