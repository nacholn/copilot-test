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

interface FilterCyclingLevelSelectorProps {
  value: string; // Can be empty string for filter
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function FilterCyclingLevelSelector({
  value,
  onChange,
  placeholder = 'All Levels',
  className,
}: FilterCyclingLevelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLevel = cyclingLevels.find((level) => level.value === value);

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

  const handleLevelChange = (newValue: string) => {
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
        aria-label="Filter by cycling level"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className={styles.selected}>
          <span className={styles.icon}>{currentLevel?.icon || '🔽'}</span>
          <span className={styles.name}>{currentLevel?.name || placeholder}</span>
          <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>▼</span>
        </div>

        {isOpen && (
          <div className={styles.dropdownMenu} role="listbox">
            <div
              className={`${styles.option} ${!value ? styles.optionSelected : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleLevelChange('');
              }}
              role="option"
              aria-selected={!value}
            >
              <span className={styles.icon}>🔽</span>
              <span className={styles.name}>{placeholder}</span>
            </div>
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
