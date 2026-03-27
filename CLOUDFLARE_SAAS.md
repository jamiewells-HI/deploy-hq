# Cloudflare for SaaS Setup (Wildcard & Custom Subdomains)

This guide explains how to configure your Cloudflare account so that `any-subdomain.deployhq.app` (or your custom domain) automatically routes to your users' sites and issues SSL certificates automatically.

---

## 1. Prerequisites (What you need)
*   **A Custom Domain:** (e.g., `deployhq.app` or `mysaas.com`) registered and active in Cloudflare.
*   **The SaaS Plan:** On the Cloudflare free tier, you get **100 custom hostnames for free**. 

## 2. Setting Your Zone ID
The Zone ID is required so our API can find your domain's records.
1. Clear the main **Cloudflare Dashboard** and click on your domain.
2. Scroll down on the **Overview** page (the first page you see).
3. Find the **API** section on the right side.
4. Copy the **Zone ID** and paste it into your `.env`:
   ```env
   CLOUDFLARE_ZONE_ID="acb123..."
   ```

---

## 3. Configuring the Fallback Origin
You need to tell Cloudflare where to send users if they visit a subdomain like `project-1.yoursite.com`.

1. Go to **SSL/TLS** -> **Custom Hostnames**.
2. Click **Enable Cloudflare for SaaS**. (You will need to provide a credit card for verification, even on the free tier).
3. Under **Fallback Origin**, enter your main Cloudflare Pages/Worker URL:
   * Example: `your-dashboard.pages.dev`
4. Click **Add Fallback Origin**. Cloudflare will verify it in a few minutes.

---

## 4. Setting the Wildcard Record
To allow *any* possible subdomain to resolve instantly:

1. Go to **DNS** -> **Records**.
2. Click **Add Record**.
3. **Type:** `CNAME`
4. **Name:** `*` (This is the wildcard!)
5. **Target:** Your Fallback Origin URL (e.g., `your-dashboard.pages.dev`).
6. **Proxy Status:** Proxied (Orange cloud).
7. **Save.**

---

## 5. Automated Registration
When a user on your platform creates a project, the dashboard now automatically calls `src/lib/cloudflare.ts` to register the new hostname. 

**What our code does behind the scenes:**
1. Calls the Cloudflare API to add the new subdomain.
2. Requests an **SSL Certificate** automatically.
3. The user's site is usually live with a green lock icon in **under 2 minutes**.

**To check the status:**
Go to the **SSL/TLS** -> **Custom Hostnames** tab in Cloudflare. You will see every user's subdomain listed there as they join your platform!
