# OAuth Providers Configuration

Quick reference guide for configuring OAuth providers (Google, Apple, Microsoft) with Supabase.

## Supabase Callback URL

All OAuth providers need this redirect URI:
```
https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
```

Replace `YOUR-PROJECT-ID` with your actual Supabase project ID.

---

## Google OAuth

### Setup Steps

1. **Google Cloud Console**: https://console.cloud.google.com/
2. Create project or select existing
3. **APIs & Services** → **Credentials**
4. **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Add authorized redirect URI:
   ```
   https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
   ```
7. Copy **Client ID** and **Client secret**

### Supabase Configuration

1. **Authentication** → **Providers** → **Google**
2. Enable Google
3. Paste Client ID and Client secret
4. Save

### Scopes
Default scopes are sufficient:
- `openid`
- `email`
- `profile`

---

## Apple OAuth

### Setup Steps

1. **Apple Developer Portal**: https://developer.apple.com
2. **Certificates, Identifiers & Profiles**
3. Create **App ID** with "Sign in with Apple" enabled
4. Create **Services ID**:
   - Identifier: `com.yourcompany.cycling-network`
   - Configure "Sign in with Apple"
   - Add domain: `YOUR-PROJECT-ID.supabase.co`
   - Add redirect URL: `https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback`
5. Create **Private Key** for Sign in with Apple
6. Download P8 file

### Supabase Configuration

1. **Authentication** → **Providers** → **Apple**
2. Enable Apple
3. Enter:
   - **Services ID**: Your Services ID identifier
   - **Team ID**: From Apple Developer account
   - **Key ID**: From private key creation
   - **Private Key**: Contents of P8 file
4. Save

### Notes
- Apple Sign In requires verified domain in production
- Test with TestFlight for mobile
- Users can choose to hide their email (creates relay email)

---

## Microsoft/Azure OAuth (Outlook)

### Setup Steps

1. **Azure Portal**: https://portal.azure.com
2. **Azure Active Directory** → **App registrations**
3. **New registration**:
   - Name: `Cycling Network`
   - Supported account types: **Personal Microsoft accounts and organizational accounts**
   - Redirect URI: 
     ```
     https://YOUR-PROJECT-ID.supabase.co/auth/v1/callback
     ```
4. Copy **Application (client) ID** and **Directory (tenant) ID**
5. **Certificates & secrets** → **New client secret**
6. Copy secret value (shown once!)

### Supabase Configuration

1. **Authentication** → **Providers** → **Azure**
2. Enable Azure
3. Enter:
   - **Client ID**: Application (client) ID
   - **Secret**: Client secret value
   - **Azure Tenant**: Use `common` for personal + organizational accounts
4. Save

### Account Types
- `common`: Personal + organizational (recommended)
- `organizations`: Only organizational accounts
- `consumers`: Only personal Microsoft accounts
- `{tenant-id}`: Specific organization only

---

## Testing OAuth Flow

### Web App

```typescript
// In your component
import { signInWithOAuth } from '@/lib/auth';

// Google
await signInWithOAuth('google');

// Apple
await signInWithOAuth('apple');

// Microsoft
await signInWithOAuth('azure');
```

### Mobile App (React Native)

1. Install dependencies:
   ```bash
   npx expo install expo-web-browser expo-auth-session
   ```

2. Use Supabase client:
   ```typescript
   import { createBrowserClient } from '@cycling-network/config/supabase';
   
   const supabase = createBrowserClient();
   
   // OAuth sign in
   await supabase.auth.signInWithOAuth({
     provider: 'google', // or 'apple' or 'azure'
     options: {
       redirectTo: 'your-app://auth/callback',
     },
   });
   ```

---

## Common Issues

### Redirect URI Mismatch
**Error**: `redirect_uri_mismatch` or similar

**Solution**:
- Verify exact match in OAuth provider settings
- Check for http vs https
- No trailing slashes unless required
- Case sensitive

### Invalid Client ID
**Error**: `invalid_client_id` or `unauthorized_client`

**Solution**:
- Double-check client ID in Supabase dashboard
- Verify client ID in OAuth provider console
- Copy-paste to avoid typos

### Scope Errors
**Error**: `invalid_scope` or permission denied

**Solution**:
- Use default scopes (email, profile, openid)
- Check if additional scopes are required by provider
- Some scopes require verification (Google, Microsoft)

### Apple Private Key Issues
**Error**: Cannot parse private key

**Solution**:
- Copy entire P8 file content including headers:
  ```
  -----BEGIN PRIVATE KEY-----
  ...
  -----END PRIVATE KEY-----
  ```
- No extra spaces or line breaks
- Use plain text editor (not Word/Rich text)

---

## Production Checklist

### All Providers
- [ ] HTTPS enabled (required for OAuth)
- [ ] Production domain verified
- [ ] Redirect URIs updated with production URL
- [ ] Test OAuth flow on production
- [ ] Monitor authentication logs

### Google
- [ ] OAuth consent screen configured
- [ ] App verification (if using sensitive scopes)
- [ ] Brand logo added

### Apple
- [ ] Domain verified in Apple Developer
- [ ] Email relay configured
- [ ] App listed in App Store (for public use)

### Microsoft
- [ ] Publisher domain verified
- [ ] Appropriate account types selected
- [ ] Client secret expiry noted (rotate before expiry)

---

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Guide](https://developer.apple.com/sign-in-with-apple/)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)

---

**Configured OAuth?** Great! Users can now sign in with their preferred provider. 🎉
