'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslations } from '../../../hooks/useTranslations';
import { AuthGuard } from '../../../components/AuthGuard';
import { GroupForm } from '../../../components/GroupForm';
import type { CreateGroupInput } from '@cyclists/config';
import styles from './create.module.css';

export default function CreateGroup() {
  const { user } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateGroupInput) => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          createdBy: user.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(t('groups.createGroupSuccess'));
        router.push(`/groups/${result.data.id}`);
      } else {
        alert(result.error || t('groups.createGroupFailed'));
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert(t('groups.createGroupFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <button
              onClick={() => router.back()}
              className={styles.backButton}
            >
              ← {t('common.back')}
            </button>
            <h1 className={styles.title}>{t('groups.createGroup')}</h1>
          </div>

          <GroupForm
            onSubmit={handleSubmit}
            submitLabel={t('groups.createGroup')}
            loading={loading}
          />
        </div>
      </main>
    </AuthGuard>
  );
}
