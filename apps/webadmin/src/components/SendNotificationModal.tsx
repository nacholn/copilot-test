import { useState } from 'react';
import type { Profile } from '@cyclists/config';
import styles from '../styles/common.module.css';

interface SendNotificationModalProps {
  user?: Profile;
  groupId?: string;
  groupName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SendNotificationModal({
  user,
  groupId,
  groupName,
  onClose,
  onSuccess,
}: SendNotificationModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !body) {
      setError('Title and message are required');
      return;
    }

    try {
      setSending(true);
      setError(null);

      const endpoint = groupId
        ? `/api/webadmin/push-notifications/group`
        : `/api/webadmin/push-notifications/user`;

      const payload = groupId
        ? {
            groupId,
            notification: {
              title,
              body,
              icon: '/icon-192x192.png',
              badge: '/badge-72x72.png',
              data: url ? { url } : undefined,
            },
          }
        : {
            userId: user?.userId,
            notification: {
              title,
              body,
              icon: '/icon-192x192.png',
              badge: '/badge-72x72.png',
              data: url ? { url } : undefined,
            },
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Failed to send notification');
      }
    } catch (err) {
      console.error('Error sending notification:', err);
      setError('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const recipientText = groupId
    ? `All members of group: ${groupName}`
    : user
    ? `${user.name} (${user.email})`
    : 'Unknown recipient';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className={styles.card}
        style={{
          maxWidth: '500px',
          width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Send Push Notification</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            To: {recipientText}
          </p>
        </div>

        {success ? (
          <div
            style={{
              padding: '20px',
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            ✓ Notification sent successfully!
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div
                style={{
                  padding: '12px',
                  marginBottom: '15px',
                  backgroundColor: '#ffebee',
                  color: '#c62828',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px',
                }}
              >
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
                disabled={sending}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px',
                }}
              >
                Message *
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Notification message"
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical',
                }}
                disabled={sending}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '500',
                  fontSize: '14px',
                }}
              >
                Action URL (optional)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
                disabled={sending}
              />
              <small style={{ color: '#666', fontSize: '12px', marginTop: '3px', display: 'block' }}>
                URL to navigate when notification is clicked
              </small>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} className={styles.button} disabled={sending}>
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.button} ${styles.buttonPrimary}`}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
