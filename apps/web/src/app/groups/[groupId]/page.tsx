'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslations } from '../../../hooks/useTranslations';
import { AuthGuard } from '../../../components/AuthGuard';
import { Loader } from '../../../components/Loader';
import { Avatar } from '../../../components/Avatar';
import type { GroupWithDetails, GroupMessageWithSender } from '@cyclists/config';
import styles from './group-detail.module.css';

export default function GroupDetail() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [group, setGroup] = useState<GroupWithDetails | null>(null);
  const [messages, setMessages] = useState<GroupMessageWithSender[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'info'>('chat');

  useEffect(() => {
    if (user && groupId) {
      fetchGroup();
      fetchMessages();
    }
  }, [user, groupId]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when viewing chat
    if (user && groupId && group?.isMember && activeTab === 'chat') {
      markMessagesAsRead();
    }
  }, [user, groupId, group?.isMember, activeTab]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${groupId}?userId=${user?.id}`);
      const data = await response.json();

      if (data.success) {
        setGroup(data.data);
      } else {
        alert(data.error);
        router.push('/groups');
      }
    } catch (error) {
      console.error('Error fetching group:', error);
      router.push('/groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `/api/groups/${groupId}/messages?userId=${user?.id}&limit=50`
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.data.reverse());
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await fetch(`/api/groups/${groupId}/messages?userId=${user?.id}`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user) return;

    setSending(true);
    const messageToSend = messageText.trim();
    setMessageText('');

    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          message: messageToSend,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add message to list
        setMessages([...messages, data.data]);
      } else {
        alert(data.error);
        setMessageText(messageToSend);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageText(messageToSend);
    } finally {
      setSending(false);
    }
  };

  const handleJoinLeave = async () => {
    if (!user || !group) return;

    setActionLoading(true);
    try {
      if (group.isMember) {
        // Leave group
        const response = await fetch(`/api/groups/${groupId}/members?userId=${user.id}`, {
          method: 'DELETE',
        });
        const data = await response.json();

        if (data.success) {
          router.push('/groups');
        } else {
          alert(data.error || t('groups.leaveFailed'));
        }
      } else {
        // Join group
        const response = await fetch(`/api/groups/${groupId}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await response.json();

        if (data.success) {
          // Refresh group data
          await fetchGroup();
        } else {
          alert(data.error || t('groups.joinFailed'));
        }
      }
    } catch (error) {
      console.error('Error joining/leaving group:', error);
      alert(group.isMember ? t('groups.leaveFailed') : t('groups.joinFailed'));
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

  if (!group) {
    return null;
  }

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <button onClick={() => router.back()} className={styles.backButton}>
              ← {t('common.back')}
            </button>
          </div>

          <div className={styles.groupHeader}>
            {group.mainImage ? (
              <img src={group.mainImage} alt={group.name} className={styles.groupImage} />
            ) : (
              <div className={styles.groupImagePlaceholder}>
                <span className={styles.groupImageEmoji}>👥</span>
              </div>
            )}
            <div className={styles.groupInfo}>
              <h1 className={styles.groupName}>{group.name}</h1>
              <p className={styles.groupMeta}>
                {group.type === 'location' ? '📍' : '🌍'}{' '}
                {group.type === 'location' ? t('groups.locationBased') : t('groups.general')}
                {group.city && ` • ${group.city}`} • {group.memberCount}{' '}
                {group.memberCount === 1 ? t('groups.member') : t('groups.members')}
              </p>
              {group.creatorName && (
                <p className={styles.creator}>
                  {t('groups.createdBy')} {group.creatorName}
                </p>
              )}
            </div>
            <button
              onClick={handleJoinLeave}
              className={`${styles.actionButton} ${group.isMember ? styles.leaveButton : styles.joinButton}`}
              disabled={actionLoading}
            >
              {actionLoading
                ? '...'
                : group.isMember
                  ? t('groups.leaveGroup')
                  : t('groups.joinGroup')}
            </button>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'chat' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              {t('groups.groupChat')}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'info' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('info')}
            >
              {t('groups.groupDetails')}
            </button>
          </div>

          {activeTab === 'chat' ? (
            <>
              {!group.isMember ? (
                <div className={styles.notMember}>
                  <p>{t('groups.joinGroup')} to participate in the chat</p>
                </div>
              ) : (
                <>
                  <div className={styles.messagesContainer}>
                    {messages.length === 0 ? (
                      <div className={styles.noMessages}>
                        <p>{t('groups.noMessages')}</p>
                        <p>{t('groups.startChatting')}</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`${styles.message} ${
                            message.senderId === user?.id ? styles.sent : styles.received
                          }`}
                        >
                          {message.senderId !== user?.id && (
                            <Avatar
                              src={message.senderAvatar}
                              name={message.senderName}
                              size="small"
                            />
                          )}
                          <div className={styles.messageContent}>
                            {message.senderId !== user?.id && (
                              <span className={styles.senderName}>{message.senderName}</span>
                            )}
                            <p className={styles.messageText}>{message.message}</p>
                            <span className={styles.messageTime}>
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className={styles.messageForm}>
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={t('groups.typeMessage')}
                      className={styles.messageInput}
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={sending || !messageText.trim()}
                      className={styles.sendButton}
                    >
                      {sending ? '...' : '➤'}
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            <div className={styles.infoContent}>
              {group.description && (
                <div className={styles.infoSection}>
                  <h3 className={styles.infoTitle}>Description</h3>
                  <p className={styles.infoText}>{group.description}</p>
                </div>
              )}

              <div className={styles.infoSection}>
                <h3 className={styles.infoTitle}>{t('groups.groupMembers')}</h3>
                <p className={styles.infoText}>
                  {group.memberCount} {group.memberCount === 1 ? t('groups.member') : t('groups.members')}
                </p>
              </div>

              {group.images && group.images.length > 0 && (
                <div className={styles.infoSection}>
                  <h3 className={styles.infoTitle}>Gallery</h3>
                  <div className={styles.gallery}>
                    {group.images.map((image) => (
                      <img
                        key={image.id}
                        src={image.imageUrl}
                        alt="Group gallery"
                        className={styles.galleryImage}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
