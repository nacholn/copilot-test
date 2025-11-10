import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from '@cyclists/ui';
import { Picker } from '@react-native-picker/picker';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('beginner');
  const [bikeType, setBikeType] = useState<'road' | 'mountain' | 'hybrid' | 'electric' | 'gravel' | 'other'>('road');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          profile: { level, bikeType, city },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        Alert.alert('Error', data.error || 'Registration failed');
        return;
      }

      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.push('/profile') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="your@email.com"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        <View style={styles.field}>
          <Text style={styles.label}>Cycling Level</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={level}
              onValueChange={setLevel}
            >
              <Picker.Item label="Beginner" value="beginner" />
              <Picker.Item label="Intermediate" value="intermediate" />
              <Picker.Item label="Advanced" value="advanced" />
              <Picker.Item label="Expert" value="expert" />
            </Picker>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bike Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={bikeType}
              onValueChange={setBikeType}
            >
              <Picker.Item label="Road" value="road" />
              <Picker.Item label="Mountain" value="mountain" />
              <Picker.Item label="Hybrid" value="hybrid" />
              <Picker.Item label="Electric" value="electric" />
              <Picker.Item label="Gravel" value="gravel" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <Input
          label="City"
          value={city}
          onChangeText={setCity}
          placeholder="Your city"
        />

        <Button
          title={loading ? 'Creating Account...' : 'Create Account'}
          onPress={handleRegister}
          disabled={loading}
        />

        <Text style={styles.footer}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => router.push('/login')}>
            Sign in
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#000',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
    color: '#6B7280',
  },
  link: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
