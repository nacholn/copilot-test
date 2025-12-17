'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslations } from '../../../hooks/useTranslations';
import { AuthGuard } from '../../../components/auth/AuthGuard';
import { Avatar } from '../../../components/profile/Avatar';
import { Loader } from '../../../components/ui/Loader';
import { ProfileImageGallery } from '../../../components/profile/ProfileImageGallery';
import type { Profile } from '@bicicita/config';
import Swal from 'sweetalert2';
import styles from './userProfile.module.css';

export default function UserProfile() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestReceived, setFriendRequestReceived] = useState(false);
  const [friendRequestId, setFriendRequestId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const fetchUserProfile = useCallback(async () => {
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
  }, [userId]);

  const checkFriendship = useCallback(async () => {
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
  }, [user, userId]);

  const checkFriendRequests = useCallback(async () => {
    if (!user) return;

    try {
      // Check sent requests
      const sentResponse = await fetch(`/api/friend-requests?userId=${user.id}&type=sent&status=pending`);
      const sentData = await sentResponse.json();
      if (sentData.success) {
        const sentRequest = sentData.data.find((req: any) => req.addresseeId === userId);
        if (sentRequest) {
          setFriendRequestSent(true);
          setFriendRequestId(sentRequest.id);
        }
      }

      // Check received requests
      const receivedResponse = await fetch(`/api/friend-requests?userId=${user.id}&type=received&status=pending`);
      const receivedData = await receivedResponse.json();
      if (receivedData.success) {
        const receivedRequest = receivedData.data.find((req: any) => req.requesterId === userId);
        if (receivedRequest) {
          setFriendRequestReceived(true);
          setFriendRequestId(receivedRequest.id);
        }
      }
    } catch (error) {
      console.error('Error checking friend requests:', error);
    }
  }, [user, userId]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      checkFriendship();
      checkFriendRequests();
    }
  }, [userId, fetchUserProfile, checkFriendship, checkFriendRequests]);

  const handleSendFriendRequest = async () => {
    if (!user) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/friend-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterId: user.id,
          addresseeId: userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFriendRequestSent(true);
        setFriendRequestId(data.data.id);
        
        Swal.fire({
          title: 'Request Sent!',
          text: 'Friend request sent successfully!',
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
          text: data.error || 'Failed to send friend request',
          icon: 'error',
          confirmButtonColor: '#FE3C72',
          customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
          },
        });
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to send friend request. Please try again.',
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

  const handleAcceptFriendRequest = async () => {
    if (!friendRequestId) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/friend-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: friendRequestId,
          status: 'accepted',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFriendRequestReceived(false);
        setIsFriend(true);
        
        Swal.fire({
          title: 'Accepted!',
          text: 'You are now friends!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
          },
        });

        // Refresh to get friendship ID
        checkFriendship();
      } else {
        Swal.fire({
          title: 'Error',
          text: data.error || 'Failed to accept friend request',
          icon: 'error',
          confirmButtonColor: '#FE3C72',
          customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
          },
        });
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to accept friend request. Please try again.',
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
        <Loader fullScreen message={t('common.loading')} />
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
              <div className={styles.infoCard}>
                <span className={styles.icon}>⭐</span>
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>{t('profile.level')}</span>
                  <span className={styles.infoValue}>{t(`levels.${profile.level}`)}</span>
                </div>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.icon}>🚴</span>
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>{t('profile.bikeType')}</span>
                  <span className={styles.infoValue}>{t(`bikeTypes.${profile.bikeType}`)}</span>
                </div>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.icon}>📍</span>
                <div className={styles.infoContent}>
                  <span className={styles.infoLabel}>{t('profile.city')}</span>
                  <span className={styles.infoValue}>{profile.city}</span>
                </div>
              </div>
              {profile.dateOfBirth && (
                <div className={styles.infoCard}>
                  <span className={styles.icon}>🎂</span>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>{t('profile.dateOfBirth')}</span>
                    <span className={styles.infoValue}>
                      {new Date(profile.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
              {profile.bio && (
                <div className={styles.infoCard}>
                  <span className={styles.icon}>📝</span>
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>{t('profile.bio')}</span>
                    <span className={styles.infoValue}>{profile.bio}</span>
                  </div>
                </div>
              )}
            </div>

            {/* User Images Gallery */}
            <div className={styles.imagesSection}>
              <button
                onClick={() => setShowGallery(!showGallery)}
                className={styles.galleryToggle}
              >
                {showGallery ? '− ' : '+ '}{t('profile.images')}
              </button>
              {showGallery && (
                <ProfileImageGallery
                  userId={userId}
                  editable={false}
                />
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
              ) : friendRequestReceived ? (
                <button
                  onClick={handleAcceptFriendRequest}
                  className={styles.acceptFriendButton}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Accepting...' : 'Accept Friend Request'}
                </button>
              ) : friendRequestSent ? (
                <button
                  className={styles.pendingButton}
                  disabled
                >
                  Request Pending
                </button>
              ) : (
                <button
                  onClick={handleSendFriendRequest}
                  className={styles.addFriendButton}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Sending...' : 'Send Friend Request'}
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
