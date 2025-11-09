# Supabase Setup Guide

Complete guide to setting up Supabase for the Cycling Network Platform with OAuth providers (Google, Apple, Microsoft/Outlook).

## Table of Contents

1. [Create Supabase Project](#1-create-supabase-project)
2. [Configure Environment Variables](#2-configure-environment-variables)
3. [Run Database Migration](#3-run-database-migration)
4. [Configure OAuth Providers](#4-configure-oauth-providers)
5. [Test Authentication](#5-test-authentication)
6. [Troubleshooting](#troubleshooting)

---

## 1. Create Supabase Project

### Step 1: Sign Up
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "Start your project" or "Sign In"
3. Sign in with GitHub (recommended) or email

### Step 2: Create Organization (if needed)
1. Click "New organization"
2. Enter organization name
3. Choose plan (Free tier is perfect for getting started)

### Step 3: Create Project
1. Click "New project"
2. Fill in the details:
   - **Name**: `cycling-network` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Plan**: Free (50K MAUs, 500MB database)
3. Click "Create new project"
4. Wait 2-3 minutes for project initialization

---

## 2. Configure Environment Variables

### Step 1: Get API Keys
1. In your Supabase Dashboard, go to **Settings** → **API**
2. You'll see three important values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbG...` (safe to expose in client)
   - **service_role**: `eyJhbG...` (KEEP SECRET!)

### Step 2: Update .env File
```bash
# In your project root
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WEB_URL=http://localhost:3000
EXPO_PUBLIC_API_URL=http://localhost:3001
```

⚠️ **Important**: 
- Never commit `.env` to git
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security - use only in backend
- `NEXT_PUBLIC_*` variables are exposed to client - don't put secrets here

---

## 3. Run Database Migration

### Step 1: Open SQL Editor
1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New query"

### Step 2: Run Migration SQL
1. Open `apps/backend/database/supabase/001_create_cyclist_profiles.sql`
2. Copy the entire contents
3. Paste into SQL Editor
4. Click "Run" or press Cmd/Ctrl + Enter

### Step 3: Verify Tables
1. Go to **Table Editor**
2. You should see:
   - `cyclist_profiles` table
   - Indexes created
   - RLS policies enabled

---

## 4. Configure OAuth Providers

Supabase supports many OAuth providers. Here's how to set up the most popular ones:

### Google OAuth

#### 1. Create Google OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
7. Save and copy:
   - Client ID
   - Client secret

#### 2. Configure in Supabase
1. Go to **Authentication** → **Providers**
2. Find "Google" and click to expand
3. Toggle "Google enabled"
4. Paste your Client ID and Client Secret
5. Click "Save"

### Apple OAuth

#### 1. Create Apple App ID
1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Create new App ID
4. Enable "Sign in with Apple"
5. Configure redirect URL:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

#### 2. Create Service ID
1. Create new Service ID in Apple Developer Portal
2. Configure "Sign in with Apple"
3. Add domains and redirect URLs
4. Generate Client Secret (requires private key)

#### 3. Configure in Supabase
1. Go to **Authentication** → **Providers**
2. Find "Apple" and click to expand
3. Toggle "Apple enabled"
4. Enter:
   - Services ID
   - Team ID
   - Key ID
   - Private Key (P8 file content)
5. Click "Save"

### Microsoft/Azure OAuth (Outlook)

#### 1. Register Azure AD App
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click "New registration"
4. Enter name: "Cycling Network"
5. Choose account type (Personal Microsoft accounts + organizational)
6. Add redirect URI:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
7. Register and copy:
   - Application (client) ID
   - Directory (tenant) ID

#### 2. Create Client Secret
1. Go to **Certificates & secrets**
2. Click "New client secret"
3. Add description and expiry
4. Copy the secret value (shown only once!)

#### 3. Configure in Supabase
1. Go to **Authentication** → **Providers**
2. Find "Azure" and click to expand
3. Toggle "Azure enabled"
4. Enter:
   - Application (client) ID
   - Client secret
   - Azure tenant (use `common` for personal accounts)
5. Click "Save"

### Additional Providers

Supabase also supports:
- **GitHub**: Great for developer-focused apps
- **GitLab**: Similar to GitHub
- **Bitbucket**: For Atlassian users
- **Facebook**: Wide user base
- **Twitter**: Quick social sign-in
- **Discord**: Gaming/community apps
- **Twitch**: Streaming community
- **Slack**: Business/team apps

Configuration process is similar for all providers:
1. Create OAuth app in provider's developer portal
2. Get client ID and secret
3. Add Supabase callback URL
4. Configure in Supabase dashboard

---

## 5. Test Authentication

### Email/Password

```bash
# Start your web app
cd apps/web && npm run dev

# Go to http://localhost:3000
# Click "Sign Up"
# Enter email and password
# Check email for verification link
```

### OAuth Providers

```bash
# Start your web app
cd apps/web && npm run dev

# Go to http://localhost:3000
# Click "Continue with Google" (or Apple/Microsoft)
# Complete OAuth flow in popup
# You'll be redirected back with authenticated session
```

### Verify in Supabase

1. Go to **Authentication** → **Users**
2. You should see your new user
3. Go to **Table Editor** → **cyclist_profiles**
4. Your profile should be automatically created

---

## Troubleshooting

### "Invalid API key"
- Double-check `.env` file has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server after changing `.env`
- Make sure no extra spaces in values

### OAuth "Redirect URI mismatch"
- Verify redirect URI in OAuth provider matches exactly:
  ```
  https://your-project-id.supabase.co/auth/v1/callback
  ```
- Check for typos, http vs https, trailing slashes

### "Profile not created automatically"
- Check trigger is enabled: Run migration SQL again
- Verify in **Database** → **Triggers**
- Test by creating new user - profile should appear in `cyclist_profiles`

### "Row Level Security policy violation"
- Profiles table should allow public reads
- Check **Authentication** → **Policies**
- Verify RLS is enabled but policies allow your operations

### "Email not verified"
- Check **Authentication** → **Email Templates**
- Verify your email settings in **Settings** → **Auth**
- For development, you can disable email confirmation:
  - Go to **Authentication** → **Settings**
  - Uncheck "Enable email confirmations"

### OAuth errors
- **Invalid client_id**: Check credentials in Supabase dashboard
- **Scope errors**: Make sure you added all required scopes in OAuth app
- **Redirect errors**: Verify redirect URL matches in both Supabase and OAuth provider

---

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` to version control
- Use different projects for development/staging/production
- Rotate secrets regularly

### 2. Row Level Security
- Always enable RLS on tables with user data
- Test policies thoroughly
- Use `auth.uid()` to reference current user

### 3. API Keys
- `anon` key is safe in client code
- `service_role` key should ONLY be in backend
- Never expose `service_role` to client

### 4. OAuth
- Use HTTPS in production
- Configure allowed redirect URLs strictly
- Review OAuth scopes - request minimum needed

---

## Supabase Free Tier Limits

✅ **Generous for MVP/small apps:**
- 50,000 monthly active users
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- Unlimited API requests
- Unlimited OAuth logins
- Email authentication included
- Social authentication included

📈 **When to upgrade:**
- \> 50K MAUs
- Need more database space
- Need more bandwidth
- Want dedicated resources
- Need point-in-time recovery

---

## Next Steps

1. ✅ Supabase project created
2. ✅ Database migrated
3. ✅ OAuth providers configured
4. ✅ Authentication tested

**Now you can:**
- Build your cyclist profile features
- Add more OAuth providers
- Customize email templates
- Add custom authentication flows
- Deploy to production

For more details, see:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [OAuth Providers Setup](https://supabase.com/docs/guides/auth/social-login)

---

**Need help?** Check `TROUBLESHOOTING.md` or [Supabase Discord](https://discord.supabase.com)
