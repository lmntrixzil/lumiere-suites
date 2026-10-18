/**
 * Minimal admin auth: one shared password (ADMIN_PASSWORD) exchanged for a
 * signed, http-only cookie. Works in both the Edge middleware and Node routes.
 */
export const ADMIN_COOKIE = "lumiere_admin";

export const adminPassword = () => process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "lumiere-admin");

/** The cookie value is a hash of the password + secret, so changing either logs everyone out. */
export async function adminToken() {
  const secret = process.env.ADMIN_SECRET || "lumiere-dev-secret";
  const data = new TextEncoder().encode(`${adminPassword()}::${secret}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function isAdminToken(value: string | undefined) {
  return !!value && !!adminPassword() && value === (await adminToken());
}
