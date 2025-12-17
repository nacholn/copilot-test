import type { GroupMemberWithProfile } from '@bicicita/config';
import styles from '../styles/common.module.css';

interface MemberListProps {
  members: GroupMemberWithProfile[];
  onRemove: (userId: string) => void;
}

export function MemberList({ members, onRemove }: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className={styles.card}>
        <p className={styles.empty}>No members in this group yet. Add some members!</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>
                <strong>{member.userName}</strong>
              </td>
              <td>{member.userEmail}</td>
              <td>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: member.role === 'admin' ? '#ffc107' : '#e0e0e0',
                    color: member.role === 'admin' ? '#000' : '#333',
                  }}
                >
                  {member.role}
                </span>
              </td>
              <td>{new Date(member.joinedAt).toLocaleDateString()}</td>
              <td>
                <button
                  className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`}
                  onClick={() => onRemove(member.userId)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
