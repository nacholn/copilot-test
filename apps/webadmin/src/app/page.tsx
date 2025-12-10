'use client';

import { useEffect, useState } from 'react';
import type { GroupWithMemberCount } from '@cyclists/config';
import styles from '../styles/common.module.css';
import { GroupList } from '../components/GroupList';
import { CreateGroupModal } from '../components/CreateGroupModal';

export default function Home() {
  const [groups, setGroups] = useState<GroupWithMemberCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/groups');
      const data = await response.json();

      if (data.success) {
        setGroups(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch groups');
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (name: string, description?: string) => {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateModal(false);
        fetchGroups();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to create group' };
      }
    } catch (err) {
      console.error('Error creating group:', err);
      return { success: false, error: 'Failed to create group' };
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) {
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchGroups();
      } else {
        alert(data.error || 'Failed to delete group');
      }
    } catch (err) {
      console.error('Error deleting group:', err);
      alert('Failed to delete group');
    }
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Group Management</h1>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={() => setShowCreateModal(true)}
          >
            Create Group
          </button>
        </div>
      </div>

      <div className={styles.container}>
        {error && (
          <div className={styles.card}>
            <p className={styles.error}>{error}</p>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Loading groups...</div>
        ) : (
          <GroupList groups={groups} onDelete={handleDeleteGroup} />
        )}
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateGroup}
        />
      )}
    </>
  );
}
