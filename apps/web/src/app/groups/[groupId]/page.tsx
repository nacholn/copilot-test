'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslations } from '../../../hooks/useTranslations';
import { AuthGuard } from '../../../components/AuthGuard';
import { Avatar } from '../../../components/Avatar';
import { Loader } from '../../../components/Loader';
import type { GroupWithDetails, GroupMessageWithSender } from '@cyclists/config';
import styles from './groupDetail.module.css';

export default function GroupDetail() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<GroupWithDetails | null>(null);
  const [messages, setMessages] = useState<GroupMessageWithSender[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchGroup();
    fetchMessages();
  }, [groupId, user]);

  const fetchGroup = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/groups/${groupId}?userId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setGroup(data.data);
      }
    } catch (error) {
      console.error('Error fetching group:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/groups/${groupId}/messages?userId=${user.id}&limit=50`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data.reverse());
        // Mark as read
        await fetch(`/api/groups/${groupId}/messages?userId=${user.id}`, {
          method: 'PATCH',
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleJoinLeave = async () => {
    if (!user || !group) return;

    setActionLoading(true);
    try {
      const endpoint = group.isMember ? 'leave' : 'join';
      const response = await fetch(`/api/groups/${groupId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();
      if (data.success) {
        fetchGroup();
        if (!group.isMember) {
          fetchMessages(); // Fetch messages after joining
        }
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error joining/leaving group:', error);
      alert(t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !messageText.trim()) return;

    setSending(true);
    const messageToSend = messageText.trim();
    setMessageText('');

    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          senderId: user.id,
          message: messageToSend,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages([...messages, data.data]);
      } else {
        setMessageText(messageToSend);
        alert(data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageText(messageToSend);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <Loader fullScreen message={t('groups.loading')} />
      </AuthGuard>
    );
  }

  if (!group) {
    return (
      <AuthGuard>
        <div className={styles.notFound}>
          <h1>Group not found</h1>
          <Link href="/groups">Back to Groups</Link>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Group Header */}
          <div className={styles.groupHeader}>
            <Avatar src={group.avatar} name={group.name} size="xlarge" />
            <div className={styles.groupInfo}>
              <h1 className={styles.groupName}>{group.name}</h1>
              <div className={styles.groupMeta}>
                <span>👥 {t('groups.memberCount', { count: group.memberCount })}</span>
                {group.location && (
                  <span>
                    📍 {group.location === 'general' ? t('groups.general') : group.location}
                  </span>
                )}
                {group.isAdmin && <span className={styles.adminBadge}>{t('groups.admin')}</span>}
              </div>
              {group.description && <p className={styles.description}>{group.description}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            {group.isMember ? (
              <>
                <button
                  onClick={handleJoinLeave}
                  disabled={actionLoading}
                  className={styles.leaveButton}
                >
                  {actionLoading ? <Loader size="small" /> : t('groups.leaveGroup')}
                </button>
                {group.isAdmin && (
                  <Link href={`/groups/${groupId}/edit`} className={styles.editButton}>
                    {t('common.edit')}
                  </Link>
                )}
              </>
            ) : (
              <button
                onClick={handleJoinLeave}
                disabled={actionLoading}
                className={styles.joinButton}
              >
                {actionLoading ? <Loader size="small" /> : t('groups.joinGroup')}
              </button>
            )}
          </div>

          {/* Messages Section (only for members) */}
          {group.isMember && (
            <div className={styles.messagesSection}>
              <h2 className={styles.sectionTitle}>{t('groups.groupMessages')}</h2>

              <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                  <div className={styles.noMessages}>
                    <p>{t('groups.noMessages')}</p>
                    <p>{t('groups.startConversation')}</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`${styles.message} ${
                        message.senderId === user?.id ? styles.sent : styles.received
                      }`}
                    >
                      <div className={styles.messageHeader}>
                        <Avatar
                          src={message.senderAvatar}
                          name={message.senderName}
                          size="small"
                        />
                        <span className={styles.senderName}>{message.senderName}</span>
                      </div>
                      <div className={styles.messageContent}>
                        <p>{message.message}</p>
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
              </div>

              <form onSubmit={handleSendMessage} className={styles.messageForm}>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={t('groups.messagePlaceholder')}
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
            </div>
          )}

          <div className={styles.backLink}>
            <Link href="/groups">{t('common.back')}</Link>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
