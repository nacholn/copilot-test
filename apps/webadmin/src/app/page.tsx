'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/common.module.css';

interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalGroups: number;
  totalPosts: number;
  publicPosts: number;
  totalMessages: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/webadmin/stats');
        const data = await response.json();

        if (data.success) {
          setStats(data.data);
          setError(null);
        } else {
          setError(data.error || 'Failed to fetch statistics');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Dashboard</h1>
        </div>
      </div>

      <div className={styles.container}>
        {error && (
          <div className={styles.card}>
            <p className={styles.error}>{error}</p>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Loading dashboard...</div>
        ) : stats ? (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '30px',
              }}
            >
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon="👥"
                color="#4CAF50"
                link="/users"
              />
              <StatCard
                title="Admin Users"
                value={stats.totalAdmins}
                icon="🔑"
                color="#FF9800"
                link="/users"
              />
              <StatCard
                title="Groups"
                value={stats.totalGroups}
                icon="👨‍👩‍👧‍👦"
                color="#2196F3"
                link="/groups"
              />
              <StatCard
                title="Total Posts"
                value={stats.totalPosts}
                icon="📝"
                color="#9C27B0"
                link="/posts"
              />
              <StatCard
                title="Public Posts"
                value={stats.publicPosts}
                icon="🌍"
                color="#00BCD4"
                link="/posts"
              />
              <StatCard
                title="Messages"
                value={stats.totalMessages}
                icon="💬"
                color="#607D8B"
              />
            </div>

            <div className={styles.card}>
              <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Quick Actions</h2>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <Link href="/users" className={`${styles.button} ${styles.buttonPrimary}`}>
                  Manage Users
                </Link>
                <Link href="/groups" className={`${styles.button} ${styles.buttonPrimary}`}>
                  Manage Groups
                </Link>
                <Link href="/posts" className={`${styles.button} ${styles.buttonPrimary}`}>
                  Manage Posts
                </Link>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  link,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
  link?: string;
}) {
  const content = (
    <div
      className={styles.card}
      style={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderLeft: `4px solid ${color}`,
        cursor: link ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        if (link) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (link) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, fontSize: '14px', color: '#666', fontWeight: '500' }}>{title}</p>
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#333',
            }}
          >
            {value.toLocaleString()}
          </p>
        </div>
        <div style={{ fontSize: '48px', opacity: 0.3 }}>{icon}</div>
      </div>
    </div>
  );

  return link ? <Link href={link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
}
