'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Post, PostVisibility } from '@cyclists/config';
import Swal from 'sweetalert2';
import styles from './EditPostButton.module.css';

interface EditPostButtonProps {
  post: Post;
  isOwner: boolean;
  userId?: string;
}

export function EditPostButton({ post, isOwner, userId }: EditPostButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [visibility, setVisibility] = useState(post.visibility);
  const [saving, setSaving] = useState(false);

  if (!isOwner) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          visibility,
          userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          title: 'Success',
          text: 'Post updated successfully',
          icon: 'success',
          confirmButtonColor: '#FE3C72',
        });
        setShowModal(false);
        router.refresh();
      } else {
        throw new Error(data.error || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Failed to update post',
        icon: 'error',
        confirmButtonColor: '#FE3C72',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className={styles.editButton}>
        ✏️ Edit Post
      </button>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit Post</h2>
              <button onClick={() => setShowModal(false)} className={styles.closeButton}>
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.input}
                  maxLength={255}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={styles.textarea}
                  rows={6}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'public' || value === 'friends') {
                      setVisibility(value as PostVisibility);
                    }
                  }}
                  className={styles.select}
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowModal(false)}
                className={styles.cancelButton}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={styles.saveButton}
                disabled={saving || !title.trim() || !content.trim()}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
