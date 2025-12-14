import type { Profile } from '@cyclists/config';
import styles from '../styles/common.module.css';

interface UserListProps {
  users: Profile[];
  onEdit: (user: Profile) => void;
  onDelete: (userId: string) => void;
}

export function UserList({ users, onEdit, onDelete }: UserListProps) {
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
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>City</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Level</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Bike Type</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Admin</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                    <span style={{ fontWeight: '500' }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{user.email}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{user.city}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      fontSize: '12px',
                      textTransform: 'capitalize',
                    }}
                  >
                    {user.level}
                  </span>
                </td>
                <td style={{ padding: '12px', fontSize: '14px', textTransform: 'capitalize' }}>
                  {user.bikeType}
                </td>
                <td style={{ padding: '12px' }}>
                  {user.isAdmin ? (
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#fff3e0',
                        color: '#f57c00',
                        fontSize: '12px',
                        fontWeight: '500',
                      }}
                    >
                      Admin
                    </span>
                  ) : (
                    <span style={{ color: '#999', fontSize: '12px' }}>User</span>
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onEdit(user)}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(user.userId)}
                      className={`${styles.button} ${styles.buttonDanger}`}
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                    >
                      Delete
                    </button>
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
