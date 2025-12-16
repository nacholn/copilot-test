import { useEffect, useState } from 'react';
import type { Profile } from '@cyclists/config';
import styles from '../styles/common.module.css';

interface PushSubscription {
  endpoint: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PushTokensModalProps {
  user: Profile;
  onClose: () => void;
}

export function PushTokensModal({ user, onClose }: PushTokensModalProps) {
  const [tokens, setTokens] = useState<PushSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        // Use webadmin-specific endpoint for detailed subscription info
        const response = await fetch(`/api/webadmin/push-subscriptions?userId=${user.userId}`);
        const data = await response.json();

        if (data.success && data.data) {
          setTokens(data.data);
          setError(null);
        } else {
          setError(data.error || 'Failed to fetch push tokens');
        }
      } catch (err) {
        console.error('Error fetching push tokens:', err);
        setError('Failed to fetch push tokens');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [user.userId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateEndpoint = (endpoint: string) => {
    if (endpoint.length <= 50) return endpoint;
    return endpoint.substring(0, 25) + '...' + endpoint.substring(endpoint.length - 22);
  };

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
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>Push Notification Tokens</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            User: {user.name} ({user.email})
          </p>
        </div>

        {loading && <div className={styles.loading}>Loading tokens...</div>}

        {error && (
          <div style={{ padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {tokens.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                No push notification tokens found for this user.
              </p>
            ) : (
              <div>
                <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
                  Total tokens: <strong>{tokens.length}</strong>
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Endpoint</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Created At</th>
                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Updated At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokens.map((token, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                          <td
                            style={{ padding: '10px', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '11px' }}
                            title={token.endpoint}
                          >
                            {truncateEndpoint(token.endpoint)}
                          </td>
                          <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                            {formatDate(token.createdAt)}
                          </td>
                          <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                            {formatDate(token.updatedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className={styles.button}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
