'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Group, GroupMemberWithProfile, Profile } from '@cyclists/config';
import styles from '../../../styles/common.module.css';
import { MemberList } from '../../../components/MemberList';
import { AddMemberModal } from '../../../components/AddMemberModal';
import { SendNotificationModal } from '../../../components/SendNotificationModal';

export default function GroupDetail() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSendNotificationModal, setShowSendNotificationModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const [groupResponse, membersResponse] = await Promise.all([
        fetch(`/api/groups/${groupId}`),
        fetch(`/api/groups/${groupId}/members`),
      ]);

      const groupData = await groupResponse.json();
      const membersData = await membersResponse.json();

      if (groupData.success) {
        setGroup(groupData.data);
        setError(null);
      } else {
        setError(groupData.error || 'Failed to fetch group');
      }

      if (membersData.success) {
        setMembers(membersData.data);
      }
    } catch (err) {
      console.error('Error fetching group details:', err);
      setError('Failed to fetch group details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const handleAddMember = async (userId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        setShowAddModal(false);
        fetchGroupDetails();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to add member' };
      }
    } catch (err) {
      console.error('Error adding member:', err);
      return { success: false, error: 'Failed to add member' };
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}/members/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchGroupDetails();
      } else {
        alert(data.error || 'Failed to remove member');
      }
    } catch (err) {
      console.error('Error removing member:', err);
      alert('Failed to remove member');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error || !group) {
    return (
      <>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Group Not Found</h1>
            <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => router.push('/')}>
              Back to Groups
            </button>
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.card}>
            <p className={styles.error}>{error || 'Group not found'}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <button
              className={`${styles.button} ${styles.buttonSmall} ${styles.buttonSecondary}`}
              onClick={() => router.push('/groups')}
              style={{ marginBottom: '10px' }}
            >
              ← Back
            </button>
            <h1 className={styles.title}>{group.name}</h1>
            {group.description && <p style={{ marginTop: '8px', color: '#6c757d' }}>{group.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={styles.button}
              onClick={() => setShowSendNotificationModal(true)}
              style={{ backgroundColor: '#4caf50', color: 'white' }}
              title="Send push notification to all members"
            >
              📲 Send Push to All Members
            </button>
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={() => setShowAddModal(true)}
            >
              Add Member
            </button>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <MemberList members={members} onRemove={handleRemoveMember} />
      </div>

      {showAddModal && (
        <AddMemberModal
          groupId={groupId}
          existingMembers={members}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMember}
        />
      )}

      {showSendNotificationModal && (
        <SendNotificationModal
          groupId={groupId}
          groupName={group.name}
          onClose={() => setShowSendNotificationModal(false)}
          onSuccess={() => fetchGroupDetails()}
        />
      )}
    </>
  );
}
