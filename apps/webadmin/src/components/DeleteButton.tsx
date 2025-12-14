'use client';

import { useState } from 'react';
import styles from '../styles/common.module.css';

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
  itemName?: string;
  confirmMessage?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function DeleteButton({
  onDelete,
  itemName = 'item',
  confirmMessage,
  className,
  style,
  children = 'Delete',
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const message =
      confirmMessage ||
      `Are you sure you want to delete this ${itemName}? This action cannot be undone.`;

    if (!confirm(message)) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={className || `${styles.button} ${styles.buttonDanger}`}
      style={{
        ...style,
        position: 'relative',
        opacity: isDeleting ? 0.7 : 1,
        cursor: isDeleting ? 'not-allowed' : 'pointer',
      }}
    >
      {isDeleting ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }}
          />
          Deleting...
        </span>
      ) : (
        children
      )}
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  );
}
