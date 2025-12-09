'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { AuthGuard } from '../../components/AuthGuard';
import { Loader } from '../../components/Loader';
import { Avatar } from '../../components/Avatar';
import type {
  Conversation,
  Message,
  GroupConversation,
  GroupMessageWithSender,
} from '@cyclists/config';
import styles from './chat.module.css';

type ConversationType = 'friend' | 'group';

interface UnifiedConversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessageText?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  type: ConversationType;
}

export default function Chat() {
  const { user } = useAuth();
  const { onNewMessage, offNewMessage, sendTypingIndicator, onlineUsers } = useWebSocket();
  const router = useRouter();
  const searchParams = useSearchParams();
  const friendIdFromUrl = searchParams.get('friendId');
  const groupIdFromUrl = searchParams.get('groupId');

  const [conversations, setConversations] = useState<UnifiedConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(friendIdFromUrl || groupIdFromUrl);
  const [selectedType, setSelectedType] = useState<ConversationType>(
    groupIdFromUrl ? 'group' : 'friend'
  );
  const [messages, setMessages] = useState<any[]>([]);
  const [messageIds, setMessageIds] = useState<Set<string>>(new Set());
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      fetchAllConversations();
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedId) {
      fetchMessages();
    }
  }, [user, selectedId, selectedType]);

  useEffect(() => {
    const handleNewMessage = (message: any) => {
      if (selectedType === 'friend') {
        if (
          selectedId &&
          !messageIds.has(message.id) &&
          ((message.senderId === selectedId && message.receiverId === user?.id) ||
            (message.senderId === user?.id && message.receiverId === selectedId))
        ) {
          const newMessage: Message = {
            id: message.id,
            senderId: message.senderId,
            receiverId: message.receiverId,
            message: message.message,
            isRead: message.senderId === user?.id,
            createdAt: new Date(message.timestamp || message.createdAt),
          };

          setMessages((prev) => [...prev, newMessage]);
          setMessageIds((prev) => new Set(prev).add(message.id));

          if (message.senderId === selectedId) {
            markAsRead();
          }
        }
      }

      fetchAllConversations();
    };

    onNewMessage(handleNewMessage);
    return () => {
      offNewMessage(handleNewMessage);
    };
  }, [user, selectedId, selectedType, messageIds, onNewMessage, offNewMessage]);

  const fetchAllConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [friendsResp, groupsResp] = await Promise.all([
        fetch(`/api/conversations?userId=${user.id}`),
        fetch(`/api/group-conversations?userId=${user.id}`),
      ]);

      const friendsData = await friendsResp.json();
      const groupsData = await groupsResp.json();

      const unified: UnifiedConversation[] = [];

      if (friendsData.success) {
        friendsData.data.forEach((conv: Conversation) => {
          unified.push({
            id: conv.friendId,
            name: conv.friendName,
            avatar: conv.friendAvatar,
            lastMessageText: conv.lastMessage?.message,
            lastMessageTime: conv.lastMessage?.createdAt,
            unreadCount: conv.unreadCount,
            type: 'friend',
          });
        });
      }

      if (groupsData.success) {
        groupsData.data.forEach((conv: GroupConversation) => {
          unified.push({
            id: conv.groupId,
            name: conv.groupName,
            avatar: conv.groupAvatar,
            lastMessageText: conv.lastMessage?.message,
            lastMessageTime: conv.lastMessage?.createdAt,
            unreadCount: conv.unreadCount,
            type: 'group',
          });
        });
      }

      // Sort by last message time
      unified.sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
        return timeB - timeA;
      });

      setConversations(unified);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!user || !selectedId) return;

    try {
      let response;
      if (selectedType === 'friend') {
        response = await fetch(`/api/messages?userId=${user.id}&friendId=${selectedId}&limit=50`);
      } else {
        response = await fetch(`/api/groups/${selectedId}/messages?userId=${user.id}&limit=50`);
      }

      const data = await response.json();

      if (data.success) {
        const reversedMessages = data.data.reverse();
        setMessages(reversedMessages);
        setMessageIds(new Set(reversedMessages.map((m: any) => m.id)));
        markAsRead();
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async () => {
    if (!user || !selectedId) return;

    try {
      if (selectedType === 'friend') {
        await fetch(`/api/messages?userId=${user.id}&friendId=${selectedId}`, {
          method: 'PATCH',
        });
      } else {
        await fetch(`/api/groups/${selectedId}/messages?userId=${user.id}`, {
          method: 'PATCH',
        });
      }
      fetchAllConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedId || !user) return;

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    if (selectedType === 'friend') {
      sendTypingIndicator(selectedId, false);
    }

    setSending(true);
    const messageToSend = messageText.trim();
    setMessageText('');

    try {
      let response;
      if (selectedType === 'friend') {
        response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: user.id,
            receiverId: selectedId,
            message: messageToSend,
          }),
        });
      } else {
        response = await fetch(`/api/groups/${selectedId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId: selectedId,
            senderId: user.id,
            message: messageToSend,
          }),
        });
      }

      const data = await response.json();

      if (data.success && !messageIds.has(data.data.id)) {
        setMessages([...messages, data.data]);
        setMessageIds((prev) => new Set(prev).add(data.data.id));
        fetchAllConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageText(messageToSend);
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (id: string, type: ConversationType) => {
    setSelectedId(id);
    setSelectedType(type);
    setMessages([]);
    setMessageIds(new Set());
  };

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  if (loading) {
    return (
      <AuthGuard>
        <Loader fullScreen message="Loading chats..." />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className={styles.chatContainer}>
        {/* Conversations List */}
        <div className={styles.conversationsList}>
          <h2 className={styles.conversationsTitle}>Messages</h2>
          {conversations.length === 0 ? (
            <div className={styles.noConversations}>
              <p>No conversations yet.</p>
              <p>Add friends or join groups to start chatting!</p>
            </div>
          ) : (
            <div className={styles.conversationsScroll}>
              {conversations.map((conversation) => (
                <button
                  key={`${conversation.type}-${conversation.id}`}
                  className={`${styles.conversationItem} ${
                    selectedId === conversation.id && selectedType === conversation.type
                      ? styles.active
                      : ''
                  }`}
                  onClick={() => handleSelectConversation(conversation.id, conversation.type)}
                >
                  <Avatar
                    src={conversation.avatar}
                    name={conversation.name}
                    size="small"
                  />
                  <div className={styles.conversationInfo}>
                    <div className={styles.conversationHeader}>
                      <h3>{conversation.name}</h3>
                      {conversation.type === 'group' && (
                        <span className={styles.groupBadge}>👥</span>
                      )}
                      {conversation.unreadCount > 0 && (
                        <span className={styles.unreadBadge}>{conversation.unreadCount}</span>
                      )}
                    </div>
                    {conversation.lastMessageText && (
                      <p className={styles.lastMessage}>
                        {conversation.lastMessageText.length > 40
                          ? conversation.lastMessageText.substring(0, 40) + '...'
                          : conversation.lastMessageText}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className={styles.chatWindow}>
          {selectedId ? (
            <>
              <div className={styles.chatHeader}>
                <Avatar
                  src={selectedConversation?.avatar}
                  name={selectedConversation?.name || ''}
                  size="small"
                />
                <div className={styles.chatHeaderInfo}>
                  <h2>{selectedConversation?.name}</h2>
                  {selectedType === 'friend' && selectedId && onlineUsers.has(selectedId) && (
                    <span className={styles.onlineIndicator}>● Online</span>
                  )}
                  {selectedType === 'group' && <span className={styles.groupTag}>Group Chat</span>}
                </div>
              </div>

              <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                  <div className={styles.noMessages}>
                    <p>No messages yet. Say hi! 👋</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isSent =
                      selectedType === 'friend'
                        ? message.senderId === user?.id
                        : message.senderId === user?.id;

                    return (
                      <div
                        key={message.id}
                        className={`${styles.message} ${isSent ? styles.sent : styles.received}`}
                      >
                        {selectedType === 'group' && !isSent && (
                          <div className={styles.groupMessageHeader}>
                            <Avatar
                              src={message.senderAvatar}
                              name={message.senderName}
                              size="small"
                            />
                            <span className={styles.senderName}>{message.senderName}</span>
                          </div>
                        )}
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
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSendMessage} className={styles.messageForm}>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
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
          ) : (
            <div className={styles.noSelection}>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
