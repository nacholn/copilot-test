import { useRouter } from 'next/navigation';
import type { GroupWithMemberCount } from '@cyclists/config';
import styles from '../styles/common.module.css';

interface GroupListProps {
  groups: GroupWithMemberCount[];
  onDelete: (groupId: string) => void;
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
            <th>Name</th>
            <th>Description</th>
            <th>Members</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.id}>
              <td>
                <strong>{group.name}</strong>
              </td>
              <td>{group.description || '-'}</td>
              <td>{group.memberCount}</td>
              <td>{new Date(group.createdAt).toLocaleDateString()}</td>
              <td>
                <div className={styles.actions}>
                  <button
                    className={`${styles.button} ${styles.buttonSmall} ${styles.buttonPrimary}`}
                    onClick={() => router.push(`/groups/${group.id}`)}
                  >
                    Manage
                  </button>
                  <button
                    className={`${styles.button} ${styles.buttonSmall} ${styles.buttonDanger}`}
                    onClick={() => onDelete(group.id)}
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
  );
}
