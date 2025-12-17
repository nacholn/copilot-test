import { useState, useEffect } from 'react';
import type { GroupMemberWithProfile, Profile } from '@bicicita/config';
import styles from '../styles/common.module.css';

interface AddMemberModalProps {
  groupId: string;
  existingMembers: GroupMemberWithProfile[];
  onClose: () => void;
  onAdd: (userId: string) => Promise<{ success: boolean; error?: string }>;
}

export function AddMemberModal({ groupId, existingMembers, onClose, onAdd }: AddMemberModalProps) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Fetch all users/profiles
        const response = await fetch('/api/profile/all');
        const data = await response.json();

        if (data.success) {
          // Filter out users who are already members
          const existingUserIds = new Set(existingMembers.map((m) => m.userId));
          const availableUsers = data.data.filter((user: Profile) => !existingUserIds.has(user.userId));
          setUsers(availableUsers);
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

    fetchUsers();
  }, [existingMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedUserId) {
      setError('Please select a user');
      return;
    }

    setSubmitting(true);
    const result = await onAdd(selectedUserId);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Failed to add member');
    }
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add Member</h2>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading users...</div>
        ) : users.length === 0 ? (
          <p className={styles.empty}>No available users to add</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="user">
                Select User *
              </label>
              <select
                id="user"
                className={styles.input}
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={submitting}
                required
              >
                <option value="">-- Select a user --</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
