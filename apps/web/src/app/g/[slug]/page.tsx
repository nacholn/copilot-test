'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslations } from '../../../hooks/useTranslations';
import { generateGroupStructuredData } from '../../../utils/structuredData';
import type { GroupWithMemberCount, GroupImage } from '@bicicita/config';
import styles from './groupDetail.module.css';

export default function PublicGroupDetail({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslations();
  const [group, setGroup] = useState<(GroupWithMemberCount & { images?: GroupImage[] }) | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGroup() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/groups/slug/${params.slug}`);

        if (!response.ok) {
          throw new Error('Group not found');
        }

        const data = await response.json();
        if (data.success) {
          setGroup(data.data);
        } else {
          setError(data.error || 'Failed to load group');
        }
      } catch (err) {
        console.error('Error fetching group:', err);
        setError('Group not found');
      } finally {
        setLoading(false);
      }
    }

    fetchGroup();
  }, [params.slug]);

  const handleJoin = () => {
    if (!user) {
      router.push(`/login?redirect=/g/${params.slug}`);
    } else {
      router.push(`/groups/${group?.id}`);
    }
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>{t('common.loading')}</div>
      </main>
    );
  }

  if (error || !group) {
    return (
      <main className={styles.main}>
        <div className={styles.error}>
          <h1>Group Not Found</h1>
          <p>{error || 'The group you are looking for does not exist.'}</p>
          <Link href="/" className={styles.backLink}>
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const structuredData = generateGroupStructuredData(group);

  return (
    <>
      <Head>
        <title>{group.name} | Bicicita</title>
        <meta
          name="description"
          content={
            group.metaDescription ||
            group.description ||
            `Join ${group.name} on Bicicita`
          }
        />
        {group.keywords && <meta name="keywords" content={group.keywords} />}
        <meta property="og:title" content={group.name} />
        <meta
          property="og:description"
          content={
            group.metaDescription ||
            group.description ||
            `Join ${group.name} on Bicicita`
          }
        />
        <meta property="og:type" content="website" />
        {group.mainImage && <meta property="og:image" content={group.mainImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={group.name} />
        <meta
          name="twitter:description"
          content={
            group.metaDescription ||
            group.description ||
            `Join ${group.name} on Bicicita`
          }
        />
        {group.mainImage && <meta name="twitter:image" content={group.mainImage} />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <main className={styles.main}>
        <article className={styles.article}>
          <header className={styles.header}>
            {' '}
            {group.mainImage && (
              <div className={styles.coverImage}>
                <img src={group.mainImage} alt={group.name} />
              </div>
            )}
            <div className={styles.headerContent}>
              <h1 className={styles.title}>{group.name}</h1>
              <div className={styles.meta}>
                <span className={styles.type}>
                  {group.type === 'location' ? '📍 Location-based' : '👥 General'}
                </span>
                {group.city && <span className={styles.city}>{group.city}</span>}
                <span className={styles.memberCount}>
                  👤 {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                </span>
              </div>
            </div>
          </header>
          {group.description && (
            <div className={styles.description}>
              <h2>{t('groups.aboutThisGroup')}</h2>
              <p>{group.description}</p>
            </div>
          )}{' '}
          {group.images && group.images.length > 0 && (
            <div className={styles.gallery}>
              <h2>Photos</h2>
              <div className={styles.images}>
                {group.images.map((image) => (
                  <img
                    key={image.id}
                    src={image.imageUrl}
                    alt={group.name}
                    className={styles.image}
                  />
                ))}
              </div>
            </div>
          )}
          <div className={styles.actions}>
            <button onClick={handleJoin} className={styles.joinButton}>
              {user ? t('groups.joinThisGroup') : t('groups.loginToJoin')}
            </button>
          </div>
          {!user && (
            <div className={styles.loginPrompt}>
              <p>{t('groups.joinCommunity')}</p>
              <div className={styles.loginActions}>
                <Link href={`/login?redirect=/g/${params.slug}`} className={styles.loginButton}>
                  Sign In
                </Link>
                <Link href="/register" className={styles.registerButton}>
                  Create Account
                </Link>
              </div>
            </div>
          )}
        </article>
      </main>
    </>
  );
}
