'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { AuthGuard } from '../../../components/AuthGuard';
import { Avatar } from '../../../components/Avatar';
import type { Profile } from '@cyclists/config';
import Swal from 'sweetalert2';
import styles from './userProfile.module.css';

export default function UserProfile() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      checkFriendship();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
      } else {
        console.error('User not found');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFriendship = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/friends?userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        const friend = data.data.find((f: any) => f.userId === userId);
        if (friend) {
          setIsFriend(true);
          setFriendshipId(friend.friendshipId);
        }
      }
    } catch (error) {
      console.error('Error checking friendship:', error);
    }
  };

  const handleAddFriend = async () => {
    if (!user) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          friendId: userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsFriend(true);
        setFriendshipId(data.data.id);
        
        Swal.fire({
          title: 'Friend Added!',
          text: 'You are now friends!',
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
          title: 'Error',
          text: data.error || 'Failed to add friend',
          icon: 'error',
          confirmButtonColor: '#FE3C72',
          customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
          },
        });
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to add friend. Please try again.',
        icon: 'error',
        confirmButtonColor: '#FE3C72',
        customClass: {
          popup: 'swal-popup',
          title: 'swal-title',
        },
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!friendshipId) return;

    const result = await Swal.fire({
      title: 'Remove Friend?',
      text: 'Are you sure you want to remove this friend from your list?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FE3C72',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, remove',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/friends?friendshipId=${friendshipId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setIsFriend(false);
        setFriendshipId(null);
        
        Swal.fire({
          title: 'Removed!',
          text: 'Friend has been removed from your list.',
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
          title: 'Error',
          text: data.error || 'Failed to remove friend',
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
        title: 'Error',
        text: 'Failed to remove friend. Please try again.',
        icon: 'error',
        confirmButtonColor: '#FE3C72',
        customClass: {
          popup: 'swal-popup',
          title: 'swal-title',
        },
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <main className={styles.main}>
          <div className={styles.container}>
            <p>Loading user profile...</p>
          </div>
        </main>
      </AuthGuard>
    );
  }

  if (!profile) {
    return (
      <AuthGuard>
        <main className={styles.main}>
          <div className={styles.container}>
            <h1>User not found</h1>
            <Link href="/users" className={styles.backButton}>
              Back to Users
            </Link>
          </div>
        </main>
      </AuthGuard>
    );
  }

  // Don't allow viewing own profile this way
  if (user?.id === userId) {
    router.push('/profile');
    return null;
  }

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.profileCard}>
            <div className={styles.avatarContainer}>
              <Avatar src={profile.avatar} name={profile.name} size="large" />
            </div>

            <h1 className={styles.name}>{profile.name}</h1>
            <p className={styles.email}>{profile.email}</p>

            <div className={styles.details}>
              <div className={styles.field}>
                <strong>Level:</strong> <span className={styles.value}>{profile.level}</span>
              </div>
              <div className={styles.field}>
                <strong>Bike Type:</strong> <span className={styles.value}>{profile.bikeType}</span>
              </div>
              <div className={styles.field}>
                <strong>City:</strong> <span className={styles.value}>{profile.city}</span>
              </div>
              {profile.dateOfBirth && (
                <div className={styles.field}>
                  <strong>Date of Birth:</strong>{' '}
                  <span className={styles.value}>
                    {new Date(profile.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              )}
              {profile.bio && (
                <div className={styles.bioSection}>
                  <strong>Bio:</strong>
                  <p className={styles.bio}>{profile.bio}</p>
                </div>
              )}
            </div>

            <div className={styles.actions}>
              {isFriend ? (
                <button
                  onClick={handleRemoveFriend}
                  className={styles.removeFriendButton}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Removing...' : 'Remove Friend'}
                </button>
              ) : (
                <button
                  onClick={handleAddFriend}
                  className={styles.addFriendButton}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Adding...' : 'Add Friend'}
                </button>
              )}
              <Link href="/users" className={styles.backButton}>
                Back to Users
              </Link>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
