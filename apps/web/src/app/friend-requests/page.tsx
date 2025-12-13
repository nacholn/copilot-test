'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from '../../hooks/useTranslations';
import { AuthGuard } from '../../components/AuthGuard';
import { Avatar } from '../../components/Avatar';
import type { FriendRequestWithProfile } from '@cyclists/config';
import Swal from 'sweetalert2';
import styles from './friend-requests.module.css';

export default function FriendRequests() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [receivedRequests, setReceivedRequests] = useState<FriendRequestWithProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestWithProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFriendRequests();
    }
  }, [user]);

  const fetchFriendRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch received requests
      const receivedResponse = await fetch(
        `/api/friend-requests?userId=${user.id}&type=received&status=pending`
      );
      const receivedData = await receivedResponse.json();
      if (receivedData.success) {
        setReceivedRequests(receivedData.data);
      }

      // Fetch sent requests
      const sentResponse = await fetch(
        `/api/friend-requests?userId=${user.id}&type=sent&status=pending`
      );
      const sentData = await sentResponse.json();
      if (sentData.success) {
        setSentRequests(sentData.data);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch('/api/friend-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          status: 'accepted',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove from list
        setReceivedRequests(receivedRequests.filter((req) => req.id !== requestId));

        Swal.fire({
          title: 'Accepted!',
          text: 'Friend request accepted. You are now friends!',
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
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const result = await Swal.fire({
      title: 'Reject Friend Request?',
      text: 'Are you sure you want to reject this friend request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FE3C72',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, reject',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await fetch('/api/friend-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          status: 'rejected',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Remove from list
        setReceivedRequests(receivedRequests.filter((req) => req.id !== requestId));

        Swal.fire({
          title: 'Rejected',
          text: 'Friend request rejected.',
          icon: 'info',
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
          text: data.error || 'Failed to reject friend request',
          icon: 'error',
          confirmButtonColor: '#FE3C72',
          customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
          },
        });
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to reject friend request. Please try again.',
        icon: 'error',
        confirmButtonColor: '#FE3C72',
        customClass: {
          popup: 'swal-popup',
          title: 'swal-title',
        },
      });
    }
  };

  const requests = useMemo(() => {
    console.log('activeTab changed:', activeTab);
    console.log('receivedRequests:', receivedRequests);
    console.log('sentRequests:', sentRequests);
    return activeTab === 'received' ? receivedRequests : sentRequests;
  }, [activeTab, receivedRequests, sentRequests]);

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Friend Requests</h1>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'received' ? styles.active : ''}`}
              onClick={() => setActiveTab('received')}
            >
              Received ({receivedRequests.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'sent' ? styles.active : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              Sent ({sentRequests.length})
            </button>
          </div>

          {loading ? (
            <p>Loading friend requests...</p>
          ) : requests.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>
                {activeTab === 'received'
                  ? t('friendRequests.noPendingReceived')
                  : t('friendRequests.noPendingSent')}
              </p>
              <Link href="/users" className={styles.button}>
                {t('friendRequests.findFriends')}
              </Link>
            </div>
          ) : (
            <div className={styles.requestsList} key={activeTab}>
              {requests.map((request) => {
                // For received requests, show requester info; for sent requests, show addressee info
                const displayName =
                  activeTab === 'received' ? request.requesterName : request.addresseeName;
                const displayAvatar =
                  activeTab === 'received' ? request.requesterAvatar : request.addresseeAvatar;
                const displayEmail =
                  activeTab === 'received' ? request.requesterEmail : request.addresseeEmail;
                const profileId =
                  activeTab === 'received' ? request.requesterId : request.addresseeId;

                return (
                  <div key={request.id} className={styles.requestCard}>
                    <Link href={`/users/${profileId}`} className={styles.requestLink}>
                      <Avatar src={displayAvatar} name={displayName} size="large" />
                      <div className={styles.requestInfo}>
                        <h3>{displayName}</h3>
                        <p className={styles.requestEmail}>{displayEmail}</p>
                        <span className={styles.requestTime}>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                    {activeTab === 'received' && (
                      <div className={styles.requestActions}>
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className={styles.acceptButton}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className={styles.rejectButton}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {activeTab === 'sent' && <div className={styles.pendingBadge}>Pending</div>}
                  </div>
                );
              })}
            </div>
          )}

          <div className={styles.actions}>
            <Link href="/friends" className={styles.button}>
              View Friends
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
