/**
 * Cloudflare SaaS Integration Utility
 * This handles registering custom subdomains (Custom Hostnames) dynamically
 * as users deploy new projects on your platform.
 */

export async function registerCustomHostname(hostname: string) {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !apiToken) {
    console.error("[Cloudflare SaaS] Missing Zone ID or API Token in .env");
    return { success: false, error: "Configuration missing" };
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hostname: hostname,
          ssl: {
            method: "http", // Automated SSL verification
            type: "dv",     // Domain Verification
            settings: {
              http2: "on",
              min_tls_version: "1.2",
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[Cloudflare SaaS] API Error:", data.errors);
      return { success: false, errors: data.errors };
    }

    return {
      success: true,
      data: data.result,
    };
  } catch (error) {
    console.error("[Cloudflare SaaS] Request Failed:", error);
    return { success: false, error: "Network or Server error" };
  }
}

/**
 * Checks the status of a user's custom domain (e.g. is it active and SSL issued?)
 */
export async function getHostnameStatus(hostname: string) {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames?hostname=${hostname}`,
      {
        headers: { Authorization: `Bearer ${apiToken}` },
      }
    );
    const data = await response.json();
    return data.result?.[0] || null;
  } catch (e) {
    return null;
  }
}
