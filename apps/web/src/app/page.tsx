'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useTranslations } from '../hooks/useTranslations';
import { PublicPostCard } from '../components/PublicPostCard';
import { PublicGroupCard } from '../components/PublicGroupCard';
import { Loader } from '../components/Loader';
import type { PostWithDetails, GroupWithMemberCount } from '@cyclists/config';
import styles from './page.module.css';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslations();
  const [latestPosts, setLatestPosts] = useState<PostWithDetails[]>([]);
  const [popularGroups, setPopularGroups] = useState<GroupWithMemberCount[]>([]);

  return (
    <Suspense fallback={<Loader fullScreen message="Loading home..." />}>
      <main className={styles.main}>{/* existing main JSX */}</main>
    </Suspense>
  );
}
