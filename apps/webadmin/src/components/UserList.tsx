import { useEffect, useState } from 'react';
import type { Profile } from '@bicicita/config';
import styles from '../styles/common.module.css';
import { DeleteButton } from './DeleteButton';

interface UserListProps {
  users: Profile[];
  onEdit: (user: Profile) => void;
  onDelete: (userId: string) => Promise<void>;
  onViewPushTokens?: (user: Profile) => void;
  onSendPush?: (user: Profile) => void;
}

export function UserList({ users, onEdit, onDelete, onViewPushTokens, onSendPush }: UserListProps) {
  const [pushTokenCounts, setPushTokenCounts] = useState<Record<string, number>>({});

  // Fetch push token counts for all users using batch endpoint
  useEffect(() => {
    const initializeEmptyCounts = () => {
      const emptyCounts: Record<string, number> = {};
      users.forEach((user) => {
        emptyCounts[user.userId] = 0;
      });
      return emptyCounts;
    };

    const fetchPushTokenCounts = async () => {
      if (users.length === 0) return;

      try {
        const userIds = users.map((user) => user.userId).join(',');
        const response = await fetch(`/api/webadmin/push-token-counts?userIds=${encodeURIComponent(userIds)}`);
        const data = await response.json();

        if (data.success && data.data) {
          setPushTokenCounts(data.data);
        } else {
          console.error('Error fetching push token counts:', data.error || 'Unknown error');
          setPushTokenCounts(initializeEmptyCounts());
        }
      } catch (error) {
        console.error('Error fetching push token counts:', error instanceof Error ? error.message : String(error));
        setPushTokenCounts(initializeEmptyCounts());
      }
    };

    fetchPushTokenCounts();
  }, [users]);

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (users.length === 0) {
    return (
      <div className={styles.card}>
        <p style={{ textAlign: 'center', color: '#666' }}>No users found.</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>City</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>Level</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>Interaction Score</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>Last Login</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>Last Post</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>Push Tokens</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>Admin</th>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                    <span style={{ fontWeight: '500' }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ padding: '10px 8px' }}>{user.email}</td>
                <td style={{ padding: '10px 8px' }}>{user.city}</td>
                <td style={{ padding: '10px 8px' }}>
                  <span
                    style={{
                      padding: '3px 6px',
                      borderRadius: '3px',
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      fontSize: '11px',
                      textTransform: 'capitalize',
                    }}
                  >
                    {user.level}
                  </span>
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '3px',
                      backgroundColor: '#f3e5f5',
                      color: '#7b1fa2',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}
                  >
                    {user.interactionScore}
                  </span>
                </td>
                <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                  {formatDate(user.lastLoginAt)}
                </td>
                <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                  {formatDate(user.lastPostCreatedAt)}
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                  <button
                    onClick={() => onViewPushTokens?.(user)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '3px',
                      backgroundColor: '#e8f5e9',
                      color: '#2e7d32',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: '600',
                    }}
                    title="View push tokens"
                  >
                    {pushTokenCounts[user.userId] ?? '...'}
                  </button>
                </td>
                <td style={{ padding: '10px 8px' }}>
                  {user.isAdmin ? (
                    <span
                      style={{
                        padding: '3px 6px',
                        borderRadius: '3px',
                        backgroundColor: '#fff3e0',
                        color: '#f57c00',
                        fontSize: '11px',
                        fontWeight: '500',
                      }}
                    >
                      Admin
                    </span>
                  ) : (
                    <span style={{ color: '#999', fontSize: '11px' }}>User</span>
                  )}
                </td>
                <td style={{ padding: '10px 8px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => onEdit(user)}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    {onSendPush && (
                      <button
                        onClick={() => onSendPush(user)}
                        className={styles.button}
                        style={{
                          padding: '5px 10px',
                          fontSize: '12px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                        }}
                        title="Send push notification"
                      >
                        📲
                      </button>
                    )}
                    <DeleteButton
                      onDelete={() => onDelete(user.userId)}
                      itemName="user"
                      confirmMessage="Are you sure you want to delete this user? This will also delete their Supabase account and all their images from Cloudinary."
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
