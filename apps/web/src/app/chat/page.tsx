'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { AuthGuard } from '../../components/AuthGuard';
import { Loader } from '../../components/Loader';
import { Avatar } from '../../components/Avatar';
import type { Conversation, Message } from '@cyclists/config';
import styles from './chat.module.css';

export default function Chat() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const friendIdFromUrl = searchParams.get('friendId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(friendIdFromUrl);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

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
      
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        fetchMessages(selectedFriendId);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [user, selectedFriendId]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedFriendId || !user) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedFriendId,
          message: messageText.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages([...messages, data.data]);
        setMessageText('');
        fetchConversations(); // Update conversation list
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
                <h2>{selectedConversation?.friendName}</h2>
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
