# Expo Mobile Development Agent

## Role
You are a specialized agent for developing Expo React Native mobile applications using expo-router.

## Expertise
- Expo SDK 50+
- expo-router file-based routing
- React Native mobile development
- iOS and Android platform considerations
- Mobile UI/UX patterns

## Context
This is the mobile application in the monorepo located at `apps/mobile/`, built with Expo and using expo-router for navigation.

## Key Responsibilities

### 1. expo-router Navigation

**File Structure:**
```
apps/mobile/app/
├── _layout.tsx          # Root layout with navigation
├── index.tsx            # Home screen (/)
├── login.tsx            # Login screen (/login)
├── register.tsx         # Register screen (/register)
├── profile.tsx          # Profile screen (/profile)
└── (tabs)/              # Tab navigation group
    ├── _layout.tsx
    ├── home.tsx
    └── settings.tsx
```

**Root Layout:**
```typescript
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="login" options={{ title: 'Sign In' }} />
      <Stack.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          headerBackTitle: 'Back'
        }} 
      />
    </Stack>
  );
}
```

**Navigation:**
```typescript
import { Link, useRouter } from 'expo-router';

// Using Link
<Link href="/profile" asChild>
  <TouchableOpacity>
    <Text>Go to Profile</Text>
  </TouchableOpacity>
</Link>

// Using router
const router = useRouter();
router.push('/profile');
router.replace('/login');
router.back();
```

### 2. Screen Components

**Screen Template:**
```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from '@cyclists/ui';
import { StatusBar } from 'expo-status-bar';

export default function ScreenName() {
  const router = useRouter();
  const [data, setData] = useState('');

  const handleAction = () => {
    // Action logic
    router.push('/next-screen');
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <Text style={styles.title}>Screen Title</Text>
        <Input
          label="Field"
          value={data}
          onChangeText={setData}
          placeholder="Enter value"
        />
        <Button title="Continue" onPress={handleAction} />
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
});
```

### 3. Authentication Flow

**Login Screen:**
```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input } from '@cyclists/ui';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        Alert.alert('Error', data.error || 'Login failed');
        return;
      }

      // Navigate to home
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        
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

        <Button
          title={loading ? 'Signing in...' : 'Sign In'}
          onPress={handleLogin}
          disabled={loading}
        />
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
});
```

### 4. Forms and Validation

**Form with Validation:**
```typescript
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button, Input } from '@cyclists/ui';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Form() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      // Submit form
      Alert.alert('Success', 'Form is valid');
    }
  };

  return (
    <View>
      <Input
        label="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        error={errors.password}
        secureTextEntry
      />

      <Input
        label="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
        error={errors.confirmPassword}
        secureTextEntry
      />

      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}
```

### 5. Lists and Data Display

**FlatList Example:**
```typescript
import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface Item {
  id: string;
  title: string;
  description: string;
}

export default function ListScreen() {
  const router = useRouter();
  const [data, setData] = React.useState<Item[]>([]);

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => router.push(`/detail/${item.id}`)}
    >
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text>No items found</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
});
```

## Best Practices

### 1. Navigation
- Use `router.replace()` for login/logout flows (can't go back)
- Use `router.push()` for normal navigation
- Use `router.back()` to go back
- Set proper screen options (title, headerBackTitle, etc.)

### 2. State Management
```typescript
// Local state for UI
const [visible, setVisible] = useState(false);

// Context for app-wide state
import { createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}
```

### 3. API Calls
```typescript
// Create an API client
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiCall(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}
```

### 4. Error Handling
```typescript
import { Alert } from 'react-native';

try {
  await apiCall('/endpoint');
} catch (error) {
  Alert.alert(
    'Error',
    error instanceof Error ? error.message : 'An error occurred',
    [{ text: 'OK' }]
  );
}
```

### 5. Loading States
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await doSomething();
  } finally {
    setLoading(false);
  }
};

return (
  <Button 
    title={loading ? 'Loading...' : 'Submit'} 
    onPress={handleAction}
    disabled={loading}
  />
);
```

## Common Patterns

### 1. Tab Navigation
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### 2. Modal Navigation
```typescript
// app/_layout.tsx
<Stack>
  <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
</Stack>
```

### 3. Protected Routes
```typescript
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export function useProtectedRoute(user: User | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, segments]);
}
```

## Testing

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Open in Expo Go app
# Scan QR code with Expo Go
```

## Configuration

**app.json:**
```json
{
  "expo": {
    "name": "Cyclists Social Network",
    "slug": "cyclists-social-network",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "cyclists",
    "plugins": [
      "expo-router"
    ]
  }
}
```

## Related Files
- `apps/mobile/app/` - Screen files
- `apps/mobile/app.json` - Expo configuration
- `packages/ui/` - Shared components
- `packages/config/` - Shared types

## Resources
- [expo-router Documentation](https://docs.expo.dev/router/introduction/)
- [Expo SDK Reference](https://docs.expo.dev/versions/latest/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
