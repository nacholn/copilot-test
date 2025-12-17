'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { Avatar } from '../../components/profile/Avatar';
import type { FriendProfile } from '@bicicita/config';
import Swal from 'sweetalert2';
import styles from './friends.module.css';

export default function Friends() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user, fetchFriends]);

  const handleRemoveFriend = async (friendshipId: string) => {
    const result = await Swal.fire({
      title: t('friends.removeFriendTitle'),
      text: t('friends.removeFriendText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FE3C72',
      cancelButtonColor: '#6c757d',
      confirmButtonText: t('friends.yesRemove'),
      cancelButtonText: t('common.cancel'),
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
      },
    });

    if (!result.isConfirmed) {
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
        
        Swal.fire({
          title: t('friends.removed'),
          text: t('friends.friendRemoved'),
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
          },
        });
      } else {
        Swal.fire({
          title: t('common.error'),
          text: data.error || t('friends.failedToRemove'),
          icon: 'error',
          confirmButtonColor: '#FE3C72',
          customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
          },
        });
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      Swal.fire({
        title: t('common.error'),
        text: t('friends.failedToRemoveTryAgain'),
        icon: 'error',
        confirmButtonColor: '#FE3C72',
        customClass: {
          popup: 'swal-popup',
          title: 'swal-title',
        },
      });
    }
  };

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.headerSection}>
            <h1 className={styles.title}>{t('friends.title')}</h1>
            <Link href="/friend-requests" className={styles.requestsLink}>
              {t('friendRequests.title')}
            </Link>
          </div>

          {loading ? (
            <p>{t('common.loading')}</p>
          ) : friends.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>{t('friends.noFriends')}</p>
              <Link href="/users" className={styles.addFriendsButton}>
                {t('friends.startDiscovering')}
              </Link>
            </div>
          ) : (
            <div className={styles.friendsList}>
              {friends.map((friend) => (
                <div key={friend.friendshipId} className={styles.friendCard}>
                  <Link href={`/users/${friend.userId}`} className={styles.friendLink}>
                    <Avatar src={friend.avatar} name={friend.name} size="large" />
                    <div className={styles.friendInfo}>
                      <h3>{friend.name}</h3>
                      <p className={styles.friendEmail}>{friend.email}</p>
                      <div className={styles.friendDetails}>
                        <span className={styles.badge}>{t(`levels.${friend.level}`)}</span>
                        <span className={styles.badge}>{t(`bikeTypes.${friend.bikeType}`)}</span>
                        <span className={styles.location}>📍 {friend.city}</span>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemoveFriend(friend.friendshipId)}
                    className={styles.removeButton}
                    title={t('common.remove')}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.actions}>
            <Link href="/users" className={styles.button}>
              {t('friends.startDiscovering')}
            </Link>
            <Link href="/" className={styles.button}>
              {t('profile.backToHome')}
            </Link>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
