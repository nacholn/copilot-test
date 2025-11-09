/**
 * Profile Form Component - Web Version
 * 
 * Form for editing cyclist profile information
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@cycling-network/ui';
import type { CyclistProfile, UpdateCyclistProfileRequest } from '@cycling-network/config/types';

interface ProfileFormProps {
  profile: CyclistProfile | null;
  onSave: (updates: UpdateCyclistProfileRequest) => Promise<void>;
  loading?: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSave, loading = false }) => {
  const [formData, setFormData] = useState<UpdateCyclistProfileRequest>({
    sex: profile?.sex,
    level: profile?.level,
    birthDate: profile?.birthDate,
    city: profile?.city,
    description: profile?.description,
    bikeType: profile?.bikeType,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        sex: profile.sex,
        level: profile.level,
        birthDate: profile.birthDate,
        city: profile.city,
        description: profile.description,
        bikeType: profile.bikeType,
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await onSave(formData);
      setMessage('✓ Profile updated successfully!');
    } catch (error) {
      setMessage('✗ Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#1e293b',
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>
        Edit Your Cyclist Profile
      </h2>

      <div style={fieldStyle}>
        <label htmlFor="sex" style={labelStyle}>
          Gender
        </label>
        <select
          id="sex"
          name="sex"
          value={formData.sex || ''}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label htmlFor="level" style={labelStyle}>
          Cycling Level
        </label>
        <select
          id="level"
          name="level"
          value={formData.level || ''}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">Select level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label htmlFor="birthDate" style={labelStyle}>
          Date of Birth
        </label>
        <input
          type="date"
          id="birthDate"
          name="birthDate"
          value={formData.birthDate || ''}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label htmlFor="city" style={labelStyle}>
          City/Location
        </label>
        <input
          type="text"
          id="city"
          name="city"
          value={formData.city || ''}
          onChange={handleChange}
          placeholder="e.g., Barcelona"
          style={inputStyle}
        />
      </div>

      <div style={fieldStyle}>
        <label htmlFor="bikeType" style={labelStyle}>
          Bike Type
        </label>
        <select
          id="bikeType"
          name="bikeType"
          value={formData.bikeType || ''}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="">Select bike type</option>
          <option value="road">Road Bike</option>
          <option value="mountain">Mountain Bike</option>
          <option value="hybrid">Hybrid</option>
          <option value="gravel">Gravel</option>
          <option value="electric">Electric</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div style={fieldStyle}>
        <label htmlFor="description" style={labelStyle}>
          About Me (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Tell us about yourself, your cycling goals, favorite routes..."
          rows={4}
          style={inputStyle}
        />
      </div>

      {message && (
        <div
          style={{
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            backgroundColor: message.startsWith('✓') ? '#d1fae5' : '#fee2e2',
            color: message.startsWith('✓') ? '#065f46' : '#991b1b',
          }}
        >
          {message}
        </div>
      )}

      <Button
        type="submit"
        disabled={saving || loading}
        variant="primary"
        style={{ width: '100%' }}
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  );
};
