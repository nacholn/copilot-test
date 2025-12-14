'use client';

import { useEffect, useState } from 'react';
import type { Profile } from '@cyclists/config';
import styles from '../../styles/common.module.css';
import { UserList } from '../../components/UserList';
import { EditUserModal } from '../../components/EditUserModal';

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url = searchTerm
        ? `/api/webadmin/users?search=${encodeURIComponent(searchTerm)}`
        : '/api/webadmin/users';
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleEditUser = async (userId: string, updates: any) => {
    try {
      const response = await fetch(`/api/webadmin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setEditingUser(null);
        fetchUsers();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to update user' };
      }
    } catch (err) {
      console.error('Error updating user:', err);
      return { success: false, error: 'Failed to update user' };
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete their Supabase account and all their images from Cloudinary.')) {
      return;
    }

    try {
      const response = await fetch(`/api/webadmin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>User Management</h1>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.card} style={{ marginBottom: '20px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  setSearchTerm('');
                  fetchUsers();
                }}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {error && (
          <div className={styles.card}>
            <p className={styles.error}>{error}</p>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Loading users...</div>
        ) : (
          <UserList users={users} onEdit={setEditingUser} onDelete={handleDeleteUser} />
        )}
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleEditUser}
        />
      )}
    </>
  );
}
