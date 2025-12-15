'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useTranslations } from '../../hooks/useTranslations';
import { AuthGuard } from '../../components/AuthGuard';
import { Loader } from '../../components/Loader';
import { Avatar } from '../../components/Avatar';
import type {
  Conversation,
  GroupConversation,
  Message,
  GroupMessageWithSender,
} from '@cyclists/config';
import styles from './chat.module.css';

export default function Chat() {
  const { user } = useAuth();
  const { onNewMessage, offNewMessage, sendTypingIndicator, onlineUsers } = useWebSocket();
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const friendIdFromUrl = searchParams.get('friendId');
  const groupIdFromUrl = searchParams.get('groupId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groupConversations, setGroupConversations] = useState<GroupConversation[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(friendIdFromUrl);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groupIdFromUrl);
  const [messages, setMessages] = useState<(Message | GroupMessageWithSender)[]>([]);
  const [messageIds, setMessageIds] = useState<Set<string>>(new Set());
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Define all callbacks before using them in useEffect
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/conversations?userId=${user?.id}`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.data.conversations || []);
        setGroupConversations(data.data.groupConversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchMessages = useCallback(async (friendId: string) => {
    try {
      const response = await fetch(
        `/api/messages?userId=${user?.id}&friendId=${friendId}&limit=50`
      );
      const data = await response.json();

      if (data.success) {
        // Reverse to show oldest first
        const reversedMessages = data.data.reverse();
        setMessages(reversedMessages);
        // Build message ID set for fast lookup
        setMessageIds(new Set(reversedMessages.map((m: Message) => m.id)));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [user?.id]);

  const markMessagesAsRead = useCallback(async (friendId: string) => {
    try {
      await fetch(`/api/messages?userId=${user?.id}&friendId=${friendId}`, {
        method: 'PATCH',
      });
      // Refresh conversations to update unread counts
      fetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user?.id, fetchConversations]);

  const fetchGroupMessages = useCallback(async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/messages?limit=50`);
      const data = await response.json();

      if (data.success) {
        // Reverse to show oldest first
        const reversedMessages = data.data.reverse();
        setMessages(reversedMessages);
        // Build message ID set for fast lookup
        setMessageIds(new Set(reversedMessages.map((m: GroupMessageWithSender) => m.id)));
      }
    } catch (error) {
      console.error('Error fetching group messages:', error);
    }
  }, []);

  const markGroupMessagesAsRead = useCallback(async (groupId: string) => {
    try {
      await fetch(`/api/groups/${groupId}/messages?userId=${user?.id}`, {
        method: 'PATCH',
      });
      // Refresh conversations to update unread counts
      fetchConversations();
    } catch (error) {
      console.error('Error marking group messages as read:', error);
    }
  }, [user?.id, fetchConversations]);

  // Fetch conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Fetch messages when friend or group is selected
  useEffect(() => {
    if (user && selectedFriendId) {
      fetchMessages(selectedFriendId);
      markMessagesAsRead(selectedFriendId);
    } else if (user && selectedGroupId) {
      fetchGroupMessages(selectedGroupId);
      markGroupMessagesAsRead(selectedGroupId);
    }
  }, [user, selectedFriendId, selectedGroupId, fetchMessages, markMessagesAsRead, fetchGroupMessages, markGroupMessagesAsRead]);

  // Handler for selecting a friend conversation
  const handleSelectFriend = (friendId: string) => {
    setSelectedFriendId(friendId);
    setSelectedGroupId(null);
    setMessages([]);
    setMessageIds(new Set());
  };

  // Handler for selecting a group conversation
  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setSelectedFriendId(null);
    setMessages([]);
    setMessageIds(new Set());
  };

  // Listen for new messages via WebSocket
  useEffect(() => {
    const handleNewMessage = (message: any) => {
      // Only add message if it's for the current conversation and not a duplicate
      if (
        selectedFriendId &&
        !messageIds.has(message.id) &&
        ((message.senderId === selectedFriendId && message.receiverId === user?.id) ||
          (message.senderId === user?.id && message.receiverId === selectedFriendId))
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

        // Mark as read if sender is the selected friend
        if (message.senderId === selectedFriendId) {
          markMessagesAsRead(selectedFriendId);
        }
      }

      // Refresh conversations list to update unread counts
      fetchConversations();
    };

    onNewMessage(handleNewMessage);

    return () => {
      offNewMessage(handleNewMessage);
    };
  }, [user, selectedFriendId, messageIds, onNewMessage, offNewMessage, fetchConversations, markMessagesAsRead]);

  const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);

    // Send typing indicator
    if (selectedFriendId && e.target.value.trim()) {
      sendTypingIndicator(selectedFriendId, true);

      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set new timeout to stop typing indicator after 2 seconds
      const timeout = setTimeout(() => {
        sendTypingIndicator(selectedFriendId, false);
      }, 2000);

      setTypingTimeout(timeout);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || (!selectedFriendId && !selectedGroupId) || !user) return;

    // Stop typing indicator (only for individual chats)
    if (selectedFriendId) {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
      sendTypingIndicator(selectedFriendId, false);
    }

    setSending(true);
    const messageToSend = messageText.trim();
    setMessageText(''); // Clear input immediately

    try {
      if (selectedFriendId) {
        // Send individual message
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: user.id,
            receiverId: selectedFriendId,
            message: messageToSend,
          }),
        });

        const data = await response.json();

        if (data.success) {
          const optimisticMessage: Message = {
            id: data.data.id,
            senderId: user.id,
            receiverId: selectedFriendId,
            message: messageToSend,
            isRead: false,
            createdAt: new Date(),
          };

          if (!messageIds.has(data.data.id)) {
            setMessages([...messages, optimisticMessage]);
            setMessageIds((prev) => new Set(prev).add(data.data.id));
          }

          fetchConversations();
        }
      } else if (selectedGroupId) {
        // Send group message
        const response = await fetch(`/api/groups/${selectedGroupId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: user.id,
            message: messageToSend,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Fetch updated messages to include sender info
          await fetchGroupMessages(selectedGroupId);
          fetchConversations();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message text on error
      setMessageText(messageToSend);
    } finally {
      setSending(false);
    }
  };

  const selectedConversation = conversations.find((c) => c.friendId === selectedFriendId);

  const selectedGroupConversation = groupConversations.find((gc) => gc.groupId === selectedGroupId);

  if (loading) {
    return (
      <AuthGuard>
        <Loader fullScreen message={t('chat.loadingChats')} />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className={styles.chatContainer}>
        {/* Conversations List */}
        <div className={styles.conversationsList}>
          <h2 className={styles.conversationsTitle}>Messages</h2>
          {conversations.length === 0 && groupConversations.length === 0 ? (
            <div className={styles.noConversations}>
              <p>No conversations yet.</p>
              <p>Add friends or join groups to start chatting!</p>
            </div>
          ) : (
            <div className={styles.conversationsScroll}>
              {/* Individual conversations */}
              {conversations.map((conversation) => (
                <button
                  key={conversation.friendId}
                  className={`${styles.conversationItem} ${
                    selectedFriendId === conversation.friendId ? styles.active : ''
                  }`}
                  onClick={() => handleSelectFriend(conversation.friendId)}
                >
                  <Avatar
                    src={conversation.friendAvatar}
                    name={conversation.friendName}
                    size="small"
                  />
                  <div className={styles.conversationInfo}>
                    <div className={styles.conversationHeader}>
                      <h3>{conversation.friendName}</h3>
                      {conversation.unreadCount > 0 && (
                        <span className={styles.unreadBadge}>{conversation.unreadCount}</span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className={styles.lastMessage}>
                        {conversation.lastMessage.message.length > 40
                          ? conversation.lastMessage.message.substring(0, 40) + '...'
                          : conversation.lastMessage.message}
                      </p>
                    )}
                  </div>
                </button>
              ))}

              {/* Group conversations */}
              {groupConversations.map((groupConversation) => (
                <button
                  key={groupConversation.groupId}
                  className={`${styles.conversationItem} ${styles.groupItem} ${
                    selectedGroupId === groupConversation.groupId ? styles.active : ''
                  }`}
                  onClick={() => handleSelectGroup(groupConversation.groupId)}
                >
                  {groupConversation.groupImage ? (
                    <Avatar
                      src={groupConversation.groupImage}
                      name={groupConversation.groupName}
                      size="small"
                    />
                  ) : (
                    <div className={styles.groupAvatar}>👥</div>
                  )}
                  <div className={styles.conversationInfo}>
                    <div className={styles.conversationHeader}>
                      <h3>{groupConversation.groupName}</h3>
                      {groupConversation.unreadCount > 0 && (
                        <span className={styles.unreadBadge}>{groupConversation.unreadCount}</span>
                      )}
                    </div>
                    {groupConversation.lastMessage && (
                      <p className={styles.lastMessage}>
                        <strong>{groupConversation.lastMessage.senderName}: </strong>
                        {groupConversation.lastMessage.message.length > 30
                          ? groupConversation.lastMessage.message.substring(0, 30) + '...'
                          : groupConversation.lastMessage.message}
                      </p>
                    )}
                    <p className={styles.memberCount}>{groupConversation.memberCount} members</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className={styles.chatWindow}>
          {selectedFriendId || selectedGroupId ? (
            <>
              {/* Chat Header */}
              <div className={styles.chatHeader}>
                {selectedFriendId ? (
                  <>
                    <Avatar
                      src={selectedConversation?.friendAvatar}
                      name={selectedConversation?.friendName || ''}
                      size="small"
                    />
                    <div className={styles.chatHeaderInfo}>
                      <h2>{selectedConversation?.friendName}</h2>
                      {selectedFriendId && onlineUsers.has(selectedFriendId) && (
                        <span className={styles.onlineIndicator}>● Online</span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {selectedGroupConversation?.groupImage ? (
                      <Avatar
                        src={selectedGroupConversation?.groupImage}
                        name={selectedGroupConversation?.groupName || ''}
                        size="small"
                      />
                    ) : (
                      <div className={styles.groupAvatar}>👥</div>
                    )}
                    <div className={styles.chatHeaderInfo}>
                      <h2>{selectedGroupConversation?.groupName}</h2>
                      <span className={styles.memberCount}>
                        {selectedGroupConversation?.memberCount} members
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Messages */}
              <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                  <div className={styles.noMessages}>
                    <p>
                      No messages yet. {selectedGroupId ? 'Start the conversation!' : 'Say hi! 👋'}
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isGroupMessage = 'senderName' in message;
                    const isSentByMe = message.senderId === user?.id;

                    return (
                      <div
                        key={message.id}
                        className={`${styles.message} ${
                          isSentByMe ? styles.sent : styles.received
                        }`}
                      >
                        <div className={styles.messageContent}>
                          {isGroupMessage && !isSentByMe && (
                            <p className={styles.senderName}>
                              {(message as GroupMessageWithSender).senderName}
                            </p>
                          )}
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

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className={styles.messageForm}>
                <input
                  type="text"
                  value={messageText}
                  onChange={handleMessageInputChange}
                  placeholder={t('chat.typePlaceholder')}
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
