'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { AuthGuard } from '../../components/AuthGuard';
import type { FriendProfile } from '@cyclists/config';
import styles from './friends.module.css';

export default function Friends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/friends?userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setFriends(data.data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) {
      return;
    }

    try {
      const response = await fetch(`/api/friends?friendshipId=${friendshipId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remove friend from local state
        setFriends(friends.filter((f) => f.friendshipId !== friendshipId));
        alert('Friend removed successfully!');
      } else {
        alert(data.error || 'Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend');
    }
  };

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>My Friends</h1>

          {loading ? (
            <p>Loading friends...</p>
          ) : friends.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>You don&apos;t have any friends yet.</p>
              <Link href="/users" className={styles.addFriendsButton}>
                Find Friends
              </Link>
            </div>
          ) : (
            <div className={styles.friendsList}>
              {friends.map((friend) => (
                <div key={friend.friendshipId} className={styles.friendCard}>
                  <Link href={`/users/${friend.userId}`} className={styles.friendLink}>
                    <div className={styles.friendAvatar}>
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.name} />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div className={styles.friendInfo}>
                      <h3>{friend.name}</h3>
                      <p className={styles.friendEmail}>{friend.email}</p>
                      <div className={styles.friendDetails}>
                        <span className={styles.badge}>{friend.level}</span>
                        <span className={styles.badge}>{friend.bikeType}</span>
                        <span className={styles.location}>📍 {friend.city}</span>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemoveFriend(friend.friendshipId)}
                    className={styles.removeButton}
                    title="Remove friend"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            <Link href="/users" className={styles.button}>
              Find More Friends
            </Link>
            <Link href="/" className={styles.button}>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
