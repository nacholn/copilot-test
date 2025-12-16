'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './cycling-level-selector.module.css';

const cyclingLevels = [
  { value: 'beginner', icon: '🔰', name: 'Beginner' },
  { value: 'intermediate', icon: '🚴', name: 'Intermediate' },
  { value: 'advanced', icon: '🏆', name: 'Advanced' },
  { value: 'expert', icon: '⭐', name: 'Expert' },
] as const;

export type CyclingLevel = (typeof cyclingLevels)[number]['value'];

interface CyclingLevelSelectorProps {
  value: CyclingLevel;
  onChange: (value: CyclingLevel) => void;
  required?: boolean;
  className?: string;
}

export function CyclingLevelSelector({
  value,
  onChange,
  required,
  className,
}: CyclingLevelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLevel = cyclingLevels.find((level) => level.value === value) || cyclingLevels[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLevelChange = (newValue: CyclingLevel) => {
    onChange(newValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`${styles.cyclingLevelSelector} ${className || ''}`} ref={dropdownRef}>
      <div
        className={`${styles.dropdown} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Select cycling level${required ? ' (required)' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className={styles.selected}>
          <span className={styles.icon}>{currentLevel.icon}</span>
          <span className={styles.name}>{currentLevel.name}</span>
          <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>▼</span>
        </div>

        {isOpen && (
          <div className={styles.dropdownMenu} role="listbox">
            {cyclingLevels.map((level) => (
              <div
                key={level.value}
                className={`${styles.option} ${level.value === value ? styles.optionSelected : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLevelChange(level.value);
                }}
                role="option"
                aria-selected={level.value === value}
              >
                <span className={styles.icon}>{level.icon}</span>
                <span className={styles.name}>{level.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
