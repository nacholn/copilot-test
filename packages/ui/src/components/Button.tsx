/**
 * Button Component - Web Version
 * 
 * A reusable button component following atomic design principles.
 * This is the web (React) version using standard HTML button element.
 * 
 * Usage:
 *   <Button onClick={handleClick} variant="primary">Click me</Button>
 */

import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  className = '',
  style,
}) => {
  const baseStyles = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s ease',
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: '#64748b',
      color: '#ffffff',
    },
    danger: {
      backgroundColor: '#dc2626',
      color: '#ffffff',
    },
  };

  const styles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={styles}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {children}
    </button>
  );
};
