import type { GroupType } from '@bicicita/config';
import styles from '../styles/common.module.css';

interface GroupTypeSelectorProps {
  value: GroupType;
  onChange: (type: GroupType) => void;
}

export function GroupTypeSelector({ value, onChange }: GroupTypeSelectorProps) {
  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>Group Type *</label>
      <div style={{ display: 'flex', gap: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="radio"
            name="groupType"
            value="location"
            checked={value === 'location'}
            onChange={(e) => onChange(e.target.value as GroupType)}
            style={{ cursor: 'pointer' }}
          />
          <span>Location-based</span>
          <span style={{ fontSize: '12px', color: '#6c757d' }}>(Local group with city)</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="radio"
            name="groupType"
            value="general"
            checked={value === 'general'}
            onChange={(e) => onChange(e.target.value as GroupType)}
            style={{ cursor: 'pointer' }}
          />
          <span>General</span>
          <span style={{ fontSize: '12px', color: '#6c757d' }}>(Global, no location)</span>
        </label>
      </div>
    </div>
  );
}
