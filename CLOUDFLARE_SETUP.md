# Cloudflare Integration Guide for DeployHQ

This guide explains how to automatically deploy your users' web projects using Cloudflare Pages & Workers, and how to get the keys for your `.env` file.

---

## 1. Finding Your Cloudflare Account ID

The Account ID is a unique string that Cloudflare uses to identify your organization when making API requests.

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Look at the URL in your browser. It will look something like:
   `https://dash.cloudflare.com/a1b2c3d4e5f6g7h8i9j0...`
3. The long alphanumeric string right after `dash.cloudflare.com/` is your **Account ID**.
4. **Copy this string** and paste it into your `.env`:
   ```env
   CLOUDFLARE_ACCOUNT_ID="a1b2c3d4e5f6g7h8i9j0..."
   ```

---

## 2. Generating the Cloudflare API Token

The API token gives your DeployHQ Build Worker permission to deploy code to your Cloudflare account programmatically.

1. Go to your **Cloudflare Dashboard**.
2. Click the **Profile Icon** (top right) -> **My Profile**.
3. On the left sidebar, click **API Tokens**.
4. Click the blue **Create Token** button.
5. Scroll down to the bottom and click **Create Custom Token**.
6. **Token Name**: `DeployHQ Worker`
7. **Permissions**: You need to grant the worker access to edit Pages.
   * Select **Account** -> **Cloudflare Pages** -> **Edit**
8. (Optional) If you are using Cloudflare R2 for Storage:
   * Select **Account** -> **Workers R2 Storage** -> **Edit**
9. Click **Continue to summary**, then **Create Token**.
10. **Copy the API Token** shown on the final screen. *(Note: You will never see this token again, so copy it now!)*
11. Paste it into your `.env`:
    ```env
    CLOUDFLARE_API_TOKEN="your-secure-token-string-here"
    ```

---

## 3. Configuring Cloudflare R2 (Artifact Storage)

If you are using Cloudflare R2 instead of AWS S3 to store user build logs or compressed artifacts without egress fees:

1. On the main **Cloudflare Dashboard**, look at the left sidebar and click **R2**.
2. If this is your first time, you will need to enable R2 and add a payment method (it has a very generous free tier and $0 egress/bandwidth fees).
3. Click **Create bucket**. Name it `deployhq-artifacts` (or whatever you prefer) and return to the main R2 screen.
4. **Important**: Make sure you are on the **main R2 Overview page** (where it lists your buckets, but you haven't clicked *into* a specific bucket).
5. Look on the **right side of the screen**, directly above your list of buckets. You will see a link/button that says **Manage R2 API Tokens**.
6. Click **Create API token**, name it `DeployHQ R2`, and grant it **Object Read & Write** permissions.
7. Click **Create API Token**.
8. You will be given an **Access Key ID**, a **Secret Access Key**, and an **Endpoint**. Copy these into your `.env` replacing the generic S3 keys:
   ```env
   STORAGE_ACCESS_KEY_ID="your-r2-access-key"
   STORAGE_SECRET_ACCESS_KEY="your-r2-secret-key"
   STORAGE_ENDPOINT_URL="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
   ```

---

## 4. How the Deployment Flow Works Now

With these keys in your `.env`, your platform's Build Node can securely authenticate.

When a user pushes to GitHub, DeployHQ will:
1. Clone their repo.
2. Compile the static output.
3. Automatically run:
   `npx wrangler pages deploy ./out --project-name <user-project-id> --commit-dirty=true`
4. Cloudflare will instantly map it, host it globally, and return a `.pages.dev` URL!
