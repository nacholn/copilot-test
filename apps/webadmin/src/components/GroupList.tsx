'use client';

import { useRouter } from 'next/navigation';
import type { GroupWithMemberCount } from '@cyclists/config';
import styles from '../styles/common.module.css';
import { DeleteButton } from './DeleteButton';

interface GroupListProps {
  groups: GroupWithMemberCount[];
  onDelete: (groupId: string) => Promise<void>;
}

export function GroupList({ groups, onDelete }: GroupListProps) {
  const router = useRouter();

  if (groups.length === 0) {
    return (
      <div className={styles.card}>
        <p className={styles.empty}>No groups found. Create your first group!</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Type</th>
            <th>Location</th>
            <th>Members</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.id}>
              <td>
                {group.mainImage ? (
                  <img
                    src={group.mainImage}
                    alt={group.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      background: '#e0e0e0',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}
                  >
                    🚴
                  </div>
                )}
              </td>
              <td>
                <strong>{group.name}</strong>
                {group.description && (
                  <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                    {group.description}
                  </div>
                )}
              </td>
              <td>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: group.type === 'location' ? '#e3f2fd' : '#f5f5f5',
                    color: group.type === 'location' ? '#1976d2' : '#666',
                  }}
                >
                  {group.type === 'location' ? '📍 Location' : '🌐 General'}
                </span>
              </td>
              <td>{group.city || '-'}</td>
              <td>{group.memberCount}</td>
              <td>{new Date(group.createdAt).toLocaleDateString()}</td>{' '}
              <td>
                <div className={styles.actions}>
                  <button
                    className={`${styles.button} ${styles.buttonSmall} ${styles.buttonSecondary}`}
                    onClick={() => router.push(`/groups/${group.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className={`${styles.button} ${styles.buttonSmall} ${styles.buttonPrimary}`}
                    onClick={() => router.push(`/groups/${group.id}`)}
                  >
                    Manage
                  </button>
                  <DeleteButton
                    onDelete={() => onDelete(group.id)}
                    itemName="group"
                    confirmMessage="Are you sure you want to delete this group? This will also delete all group images from Cloudinary."
                    className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
