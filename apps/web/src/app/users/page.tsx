'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { AuthGuard } from '../../components/AuthGuard';
import { Avatar } from '../../components/Avatar';
import { Loader } from '../../components/Loader';
import type { Profile } from '@cyclists/config';
import styles from './users.module.css';

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [bikeTypeFilter, setBikeTypeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, levelFilter, bikeTypeFilter, cityFilter]);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>All Users</h1>

          <div className={styles.filters}>
            <input
              type="text"
              placeholder="Search by name, email, city, or bio..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />

            <div className={styles.filterRow}>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className={styles.select}
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>

              <select
                value={bikeTypeFilter}
                onChange={(e) => setBikeTypeFilter(e.target.value)}
                className={styles.select}
              >
                <option value="">All Bike Types</option>
                <option value="road">Road</option>
                <option value="mountain">Mountain</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
                <option value="gravel">Gravel</option>
                <option value="other">Other</option>
              </select>

              <input
                type="text"
                placeholder="Filter by city"
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
                Clear Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <Loader size="large" message="Loading users..." />
            </div>
          ) : users.length === 0 ? (
            <p className={styles.noResults}>No users found matching your criteria.</p>
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
