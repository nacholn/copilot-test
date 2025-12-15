'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslations } from '../../../hooks/useTranslations';
import { AuthGuard } from '../../../components/AuthGuard';
import { Avatar } from '../../../components/Avatar';
import { Loader } from '../../../components/Loader';
import type { Group, GroupMemberWithProfile } from '@cyclists/config';
import Swal from 'sweetalert2';
import styles from './groupDetail.module.css';

export default function GroupDetail() {
  const params = useParams();
  const groupId = params.id as string;
  const { user } = useAuth();
  const { t } = useTranslations();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchGroupData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch group details
      const groupResponse = await fetch(`/api/groups/${groupId}`);
      const groupData = await groupResponse.json();

      if (groupData.success) {
        setGroup(groupData.data);
      }

      // Fetch group members
      const membersResponse = await fetch(`/api/groups/${groupId}/members`);
      const membersData = await membersResponse.json();

      if (membersData.success) {
        setMembers(membersData.data);
        // Check if current user is a member
        if (user) {
          const userIsMember = membersData.data.some(
            (member: GroupMemberWithProfile) => member.userId === user.id
          );
          setIsMember(userIsMember);
        }
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
    } finally {
      setLoading(false);
    }
  }, [groupId, user]);

  useEffect(() => {
    fetchGroupData();
  }, [groupId, fetchGroupData]);

  const handleJoinGroup = async () => {
    if (!user) return;

    try {
      setProcessing(true);
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          role: 'member',
        }),
      });

      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          title: t('groups.joined'),
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchGroupData(); // Refresh data
      } else {
        await Swal.fire({
          title: 'Error',
          text: data.error || 'Failed to join group',
          icon: 'error',
        });
      }
    } catch (error) {
      console.error('Error joining group:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Failed to join group',
        icon: 'error',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!user) return;

    const result = await Swal.fire({
      title: 'Leave Group?',
      text: 'Are you sure you want to leave this group?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FE3C72',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, leave',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      setProcessing(true);
      const response = await fetch(`/api/groups/${groupId}/members/${user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          title: t('groups.left'),
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchGroupData(); // Refresh data
      } else {
        await Swal.fire({
          title: 'Error',
          text: data.error || 'Failed to leave group',
          icon: 'error',
        });
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Failed to leave group',
        icon: 'error',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleChatClick = () => {
    router.push(`/chat?groupId=${groupId}`);
  };

  if (loading) {
    return (
      <AuthGuard>
        <Loader fullScreen message={t('common.loading')} />
      </AuthGuard>
    );
  }

  if (!group) {
    return (
      <AuthGuard>
        <div className={styles.main}>
          <div className={styles.container}>
            <p className={styles.error}>Group not found</p>
            <Link href="/my-groups" className={styles.backButton}>
              {t('common.back')}
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Group Header */}
          <div className={styles.groupHeader}>
            {group.mainImage ? (
              <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                <Image src={group.mainImage} alt={group.name} fill style={{ objectFit: 'cover' }} className={styles.groupImage} sizes="200px" />
              </div>
            ) : (
              <div className={styles.groupImagePlaceholder}>👥</div>
            )}
            <div className={styles.groupHeaderInfo}>
              <h1 className={styles.groupName}>{group.name}</h1>
              <div className={styles.groupMeta}>
                <span className={styles.badge}>{t(`groups.${group.type}`)}</span>
                {group.city && <span className={styles.location}>📍 {group.city}</span>}
                <span className={styles.memberCount}>
                  {members.length} {members.length === 1 ? t('groups.member') : t('groups.members')}
                </span>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className={styles.actions}>
            {isMember ? (
              <>
                <button onClick={handleChatClick} className={styles.primaryButton}>
                  💬 {t('groups.messages')}
                </button>
                <button
                  onClick={handleLeaveGroup}
                  disabled={processing}
                  className={styles.secondaryButton}
                >
                  {processing ? '...' : t('groups.leaveGroup')}
                </button>
              </>
            ) : (
              <button
                onClick={handleJoinGroup}
                disabled={processing}
                className={styles.primaryButton}
              >
                {processing ? '...' : t('groups.joinGroup')}
              </button>
            )}
          </div>
          {/* Group Description */}
          {group.description && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('groups.groupInfo')}</h2>
              <div className={styles.card}>
                <p className={styles.description}>{group.description}</p>
              </div>
            </div>
          )}
          {/* Members List */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {t('groups.members')} ({members.length})
            </h2>
            <div className={styles.membersList}>
              {members.map((member) => (
                <Link
                  key={member.id}
                  href={`/users/${member.userId}`}
                  className={styles.memberCard}
                >
                  <Avatar src={member.userAvatar} name={member.userName} size="small" />
                  <div className={styles.memberInfo}>
                    <h3>{member.userName}</h3>
                    <p>{member.userEmail}</p>
                    {member.role === 'admin' && (
                      <span className={styles.adminBadge}>{t('groups.admin')}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>{' '}
          {/* Back Button */}
          <div className={styles.backSection}>
            <Link href="/my-groups" className={styles.backButton}>
              {t('common.back')}
            </Link>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
