# Cloudflare Integration Mastery Guide (DeployHQ)

This guide covers everything required to connect your Cloudflare account to the DeployHQ platform, including the build workers, custom domains, and automated SSL.

---

## 1. Core API Credentials (.env)
You need to provide your platform with the power to talk to Cloudflare. 

*   **Account ID:** Found on the right sidebar of your Cloudflare Dashboard (home page).
*   **Zone ID:** Found on the **Overview** page of your specific domain (e.g. `deployhq.app`).
*   **API Token:** 
    1. Go to **My Profile** -> **API Tokens**.
    2. Create a "Custom Token".
    3. Grant permissions for **Cloudflare Pages** (Edit) and **Custom Hostnames** (Edit).

```env
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_ZONE_ID="your-domain-zone-id"
CLOUDFLARE_API_TOKEN="your-secret-token"
```

---

## 2. Setting Up "Cloudflare for SaaS" (Custom Domains)
This feature is what allows your users to add their own domains (e.g. `my-blog.com`) to your platform.

1.  **Enable SaaS Plan:** 
    *   Go to **SSL/TLS** -> **Custom Hostnames**.
    *   Click **Enable Cloudflare for SaaS**. (Found on the Free Tier, but requires payment info for identity verification).
2.  **Add Fallback Origin:**
    *   Enter the URL where your dashboard/main site is hosted (e.g., `main-platform.pages.dev`).
    *   This is the "Destination" where all user traffic is sent.
3.  **Create a Wildcard DNS Record:**
    *   Go to **DNS** -> **Records**.
    *   Add a **CNAME** record:
        *   **Name:** `*`
        *   **Target:** `your-dashboard.pages.dev`
        *   **Proxy:** Proxied (Orange Cloud).

---

## 3. How Users Connect Their Domains
When a user adds a domain in their dashboard, they must update their DNS settings. Tell your users to follow these steps:

#### Option A: CNAME (Recommended)
Point a CNAME record from their domain (`@` or `www`) to your platform:
*   **Type:** `CNAME`
*   **Target:** `cname.deployhq.app` (Your domain)

#### Option B: A Record (Legacy)
If their registrar doesn't support "CNAME Flatting" on the root:
*   **Type:** `A`
*   **Target:** Your Cloudflare IP Address (Found in your DNS dashboard).

---

## 4. Automation Logic
The system is pre-configured to handle registration automatically.

*   **Subdomains:** Created instantly when a project is saved as `{name}.{current_host}`.
*   **Custom Domains:** Created via the **Settings -> Domains** interface.
*   **SSL Certificates:** Cloudflare **automatically** initiates a "Verification" and issues an SSL for every domain added. 

**Wait time:** Certificates usually activate in **90 seconds** but can take up to 24 hours depending on DNS propagation.
