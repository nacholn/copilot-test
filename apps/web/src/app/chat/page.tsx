'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { AuthGuard } from '../../components/AuthGuard';
import { Loader } from '../../components/Loader';
import { Avatar } from '../../components/Avatar';
import type { Conversation, Message } from '@cyclists/config';
import styles from './chat.module.css';

export default function Chat() {
  const { user } = useAuth();
  const { onNewMessage, offNewMessage, sendTypingIndicator, onlineUsers } = useWebSocket();
  const router = useRouter();
  const searchParams = useSearchParams();
  const friendIdFromUrl = searchParams.get('friendId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(friendIdFromUrl);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fetch conversations on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Fetch messages when friend is selected
  useEffect(() => {
    if (user && selectedFriendId) {
      fetchMessages(selectedFriendId);
      // Mark messages as read
      markMessagesAsRead(selectedFriendId);
    }
  }, [user, selectedFriendId]);

  // Listen for new messages via WebSocket
  useEffect(() => {
    const handleNewMessage = (message: any) => {
      // Only add message if it's for the current conversation
      if (
        selectedFriendId &&
        ((message.senderId === selectedFriendId && message.receiverId === user?.id) ||
          (message.senderId === user?.id && message.receiverId === selectedFriendId))
      ) {
        setMessages((prev) => [...prev, {
          id: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          message: message.message,
          isRead: message.senderId === user?.id,
          createdAt: new Date(message.timestamp || message.createdAt),
        }]);

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
  }, [user, selectedFriendId, onNewMessage, offNewMessage]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/conversations?userId=${user?.id}`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (friendId: string) => {
    try {
      const response = await fetch(
        `/api/messages?userId=${user?.id}&friendId=${friendId}&limit=50`
      );
      const data = await response.json();

      if (data.success) {
        // Reverse to show oldest first
        setMessages(data.data.reverse());
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (friendId: string) => {
    try {
      await fetch(`/api/messages?userId=${user?.id}&friendId=${friendId}`, {
        method: 'PATCH',
      });
      // Refresh conversations to update unread counts
      fetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

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
    if (!messageText.trim() || !selectedFriendId || !user) return;

    // Stop typing indicator
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
    sendTypingIndicator(selectedFriendId, false);

    setSending(true);
    const messageToSend = messageText.trim();
    setMessageText(''); // Clear input immediately

    try {
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
        // Message will be added via WebSocket, but add it optimistically for better UX
        const optimisticMessage: Message = {
          id: data.data.id,
          senderId: user.id,
          receiverId: selectedFriendId,
          message: messageToSend,
          isRead: false,
          createdAt: new Date(),
        };
        
        // Check if message not already in list (from WebSocket)
        if (!messages.find((m) => m.id === data.data.id)) {
          setMessages([...messages, optimisticMessage]);
        }
        
        fetchConversations(); // Update conversation list
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message text on error
      setMessageText(messageToSend);
    } finally {
      setSending(false);
    }
  };

  const selectedConversation = conversations.find(
    (c) => c.friendId === selectedFriendId
  );

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
              <p>Add friends to start chatting!</p>
            </div>
          ) : (
            <div className={styles.conversationsScroll}>
              {conversations.map((conversation) => (
                <button
                  key={conversation.friendId}
                  className={`${styles.conversationItem} ${
                    selectedFriendId === conversation.friendId ? styles.active : ''
                  }`}
                  onClick={() => setSelectedFriendId(conversation.friendId)}
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
                        <span className={styles.unreadBadge}>
                          {conversation.unreadCount}
                        </span>
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
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className={styles.chatWindow}>
          {selectedFriendId ? (
            <>
              {/* Chat Header */}
              <div className={styles.chatHeader}>
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
              </div>

              {/* Messages */}
              <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                  <div className={styles.noMessages}>
                    <p>No messages yet. Say hi! 👋</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`${styles.message} ${
                        message.senderId === user?.id ? styles.sent : styles.received
                      }`}
                    >
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

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className={styles.messageForm}>
                <input
                  type="text"
                  value={messageText}
                  onChange={handleMessageInputChange}
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
