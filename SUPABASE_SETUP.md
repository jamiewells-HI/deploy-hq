# Supabase Setup Guide for DeployHQ

DeployHQ uses [Supabase](https://supabase.com) as its core control-plane backend. Supabase provides the **PostgreSQL Database** (which we talk to via Prisma) and handles **Authentication** natively.

Follow these steps to generate your instance and get your `.env` keys.

---

## 1. Create a Supabase Project

1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project** and select your organization.
3. **Name**: `deployhq-db` (or whatever you prefer).
4. **Database Password**: Generate a secure password and **save it somewhere safe**. You will need this string in Step 2.
5. **Region**: Choose the region closest to where you plan to host your Build Workers.
6. Click **Create new project**. Note: It may take ~2 minutes for the database to provision.

---

## 2. Getting the Database Connection URL (Prisma)

DeployHQ uses Prisma ORM to interact with the database. You need the direct connection string.

1. Once your project has finished provisioning, go to **Project Settings** (the gear icon on the bottom left of the sidebar).
2. Click **Database** under the settings menu.
3. Scroll down until you see **Connection String**.
4. Select the **URI** tab. It will look something like this:
   `postgresql://postgres.yourprojectid:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres`
5. Copy this string. First, replace `[YOUR-PASSWORD]` with the Database Password you created in Step 1.
6. Paste the final string into your `.env` file for Prisma:
   ```env
   DATABASE_URL="postgresql://postgres.yourprojectid:supersecretpassword..."
   ```

*(After adding this to your `.env`, you can run `npx prisma db push` in your terminal to automatically construct the `Projects`, `Deployments`, and `Users` tables!)*

---

## 3. Getting the Authentication API Keys

Supabase Auth handles user sign-ins and identity. You need the public URL and the API keys.

1. Go back to **Project Settings** (the gear icon).
2. Click **API** under the settings menu.
3. Look under the **Project URL** section. Copy the URL (e.g., `https://your-project-id.supabase.co`) and paste it into your `.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
   ```
4. Below that, in the **Project API keys** section, copy the `anon` / `public` key and paste it:
   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5..."
   ```
5. Directly underneath the anon key, reveal and copy the `service_role` / `secret` key. **Never share this key with anyone**, it bypasses all Row Level Security.
   ```env
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5..."
   ```

---

## 4. (Optional) Configuring GitHub OAuth Sign-In

To allow developers to log into your platform using GitHub (and ultimately give DeployHQ access to build their repositories):

1. On the left sidebar, click **Authentication** (the lock icon).
2. Click **Providers** in the top/left navigation.
3. Find **GitHub** on the list and enable it.
4. You will need to create an **OAuth App** inside your personal GitHub Settings (`GitHub > Settings > Developer Settings > OAuth Apps > New OAuth App`).
5. Paste the **Callback URL** that Supabase provides you into the GitHub OAuth setup.
6. Copy the newly generated **Client ID** and **Client Secret** from GitHub, and put them into both the Supabase Dashboard input fields *and* your `.env` file:
   ```env
   GITHUB_CLIENT_ID="..."
   GITHUB_CLIENT_SECRET="..."
   ```

You're all set! Supabase is fully wired up to DeployHQ.
