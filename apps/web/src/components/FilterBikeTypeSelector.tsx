'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './bike-type-selector.module.css';

const bikeTypes = [
  { value: 'road', icon: '🚴‍♀️', name: 'Road' },
  { value: 'mountain', icon: '🚵‍♂️', name: 'Mountain' },
  { value: 'hybrid', icon: '🚲', name: 'Hybrid' },
  { value: 'electric', icon: '⚡', name: 'Electric' },
  { value: 'gravel', icon: '🏞️', name: 'Gravel' },
  { value: 'other', icon: '🔧', name: 'Other' },
] as const;

export type BikeType = (typeof bikeTypes)[number]['value'];

interface FilterBikeTypeSelectorProps {
  value: string; // Can be empty string for filter
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function FilterBikeTypeSelector({
  value,
  onChange,
  placeholder = 'All Bike Types',
  className,
}: FilterBikeTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentBikeType = bikeTypes.find((type) => type.value === value);

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

  const handleBikeTypeChange = (newValue: string) => {
    onChange(newValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`${styles.bikeTypeSelector} ${className || ''}`} ref={dropdownRef}>
      <div
        className={`${styles.dropdown} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Filter by bike type"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className={styles.selected}>
          <span className={styles.icon}>{currentBikeType?.icon || '🔽'}</span>
          <span className={styles.name}>{currentBikeType?.name || placeholder}</span>
          <span className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}>▼</span>
        </div>

        {isOpen && (
          <div className={styles.dropdownMenu} role="listbox">
            <div
              className={`${styles.option} ${!value ? styles.optionSelected : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleBikeTypeChange('');
              }}
              role="option"
              aria-selected={!value}
            >
              <span className={styles.icon}>🔽</span>
              <span className={styles.name}>{placeholder}</span>
            </div>
            {bikeTypes.map((type) => (
              <div
                key={type.value}
                className={`${styles.option} ${type.value === value ? styles.optionSelected : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBikeTypeChange(type.value);
                }}
                role="option"
                aria-selected={type.value === value}
              >
                <span className={styles.icon}>{type.icon}</span>
                <span className={styles.name}>{type.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
