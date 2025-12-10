'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { AuthGuard } from '../../components/AuthGuard';
import { Loader } from '../../components/Loader';
import { GroupCard } from '../../components/GroupCard';
import type { GroupWithDetails } from '@cyclists/config';
import styles from './groups.module.css';

export default function Groups() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const [myGroups, setMyGroups] = useState<GroupWithDetails[]>([]);
  const [allGroups, setAllGroups] = useState<GroupWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my-groups' | 'discover'>('my-groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    if (user) {
      fetchMyGroups();
      fetchAllGroups();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'discover') {
      fetchAllGroups();
    }
  }, [user, searchQuery, typeFilter, cityFilter, activeTab]);

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/my-groups?userId=${user?.id}`);
      const data = await response.json();

      if (data.success) {
        setMyGroups(data.data);
      }
    } catch (error) {
      console.error('Error fetching my groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllGroups = async () => {
    try {
      const params = new URLSearchParams();
      params.append('userId', user?.id || '');
      if (searchQuery) params.append('query', searchQuery);
      if (typeFilter) params.append('type', typeFilter);
      if (cityFilter) params.append('city', cityFilter);

      const response = await fetch(`/api/groups?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setAllGroups(data.data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;
    
    setActionLoading(groupId);
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh both lists
        await fetchMyGroups();
        await fetchAllGroups();
      } else {
        alert(data.error || t('groups.joinFailed'));
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert(t('groups.joinFailed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to leave this group?')) return;

    setActionLoading(groupId);
    try {
      const response = await fetch(`/api/groups/${groupId}/members?userId=${user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Refresh both lists
        await fetchMyGroups();
        await fetchAllGroups();
      } else {
        alert(data.error || t('groups.leaveFailed'));
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      alert(t('groups.leaveFailed'));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <Loader fullScreen message={t('common.loading')} />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>{t('groups.title')}</h1>
            <button
              onClick={() => router.push('/groups/create')}
              className={styles.createButton}
            >
              + {t('groups.createGroup')}
            </button>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'my-groups' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('my-groups')}
            >
              {t('groups.myGroups')}
              {myGroups.length > 0 && (
                <span className={styles.tabBadge}>{myGroups.length}</span>
              )}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'discover' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('discover')}
            >
              {t('groups.discoverGroups')}
            </button>
          </div>

          {activeTab === 'my-groups' ? (
            <div className={styles.content}>
              {myGroups.length === 0 ? (
                <div className={styles.empty}>
                  <p className={styles.emptyText}>{t('groups.noMyGroups')}</p>
                  <button
                    onClick={() => setActiveTab('discover')}
                    className={styles.discoverButton}
                  >
                    {t('groups.startDiscovering')}
                  </button>
                </div>
              ) : (
                <div className={styles.grid}>
                  {myGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      showActions={true}
                      onLeave={handleLeaveGroup}
                      loading={actionLoading === group.id}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.content}>
              <div className={styles.filters}>
                <input
                  type="text"
                  placeholder={t('groups.searchGroups')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={styles.select}
                >
                  <option value="">{t('groups.allTypes')}</option>
                  <option value="location">{t('groups.locationBased')}</option>
                  <option value="general">{t('groups.general')}</option>
                </select>
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
                    setTypeFilter('');
                    setCityFilter('');
                  }}
                  className={styles.clearButton}
                >
                  {t('common.cancel')}
                </button>
              </div>

              {allGroups.length === 0 ? (
                <div className={styles.empty}>
                  <p className={styles.emptyText}>{t('groups.noGroups')}</p>
                </div>
              ) : (
                <div className={styles.grid}>
                  {allGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      showActions={true}
                      onJoin={handleJoinGroup}
                      onLeave={handleLeaveGroup}
                      loading={actionLoading === group.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
