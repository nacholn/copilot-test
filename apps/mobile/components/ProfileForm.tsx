/**
 * Profile Form Component - Mobile Version
 * 
 * Form for editing cyclist profile information in React Native
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button } from '@cycling-network/ui/native';
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

  const handleSubmit = async () => {
    setSaving(true);

    try {
      await onSave(formData);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof UpdateCyclistProfileRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Your Cyclist Profile</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.sex || ''}
            onValueChange={(value) => updateField('sex', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select gender" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
            <Picker.Item label="Prefer not to say" value="prefer_not_to_say" />
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Cycling Level</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.level || ''}
            onValueChange={(value) => updateField('level', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select level" value="" />
            <Picker.Item label="Beginner" value="beginner" />
            <Picker.Item label="Intermediate" value="intermediate" />
            <Picker.Item label="Advanced" value="advanced" />
            <Picker.Item label="Professional" value="professional" />
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
        <TextInput
          value={formData.birthDate || ''}
          onChangeText={(value) => updateField('birthDate', value)}
          placeholder="e.g., 1990-01-15"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>City/Location</Text>
        <TextInput
          value={formData.city || ''}
          onChangeText={(value) => updateField('city', value)}
          placeholder="e.g., Barcelona"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Bike Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.bikeType || ''}
            onValueChange={(value) => updateField('bikeType', value)}
            style={styles.picker}
          >
            <Picker.Item label="Select bike type" value="" />
            <Picker.Item label="Road Bike" value="road" />
            <Picker.Item label="Mountain Bike" value="mountain" />
            <Picker.Item label="Hybrid" value="hybrid" />
            <Picker.Item label="Gravel" value="gravel" />
            <Picker.Item label="Electric" value="electric" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>About Me (Optional)</Text>
        <TextInput
          value={formData.description || ''}
          onChangeText={(value) => updateField('description', value)}
          placeholder="Tell us about yourself..."
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea]}
        />
      </View>

      <Button
        onPress={handleSubmit}
        disabled={saving || loading}
        variant="primary"
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    color: '#1e293b',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#1e293b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
});
