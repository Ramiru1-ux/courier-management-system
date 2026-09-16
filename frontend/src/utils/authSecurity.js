// SHA-256 hashing via the browser's native Web Crypto API. This is what
// lets the login form compare against a stored *hash* instead of a stored
// plaintext password (FR-01: "Passwords must never be stored as
// plaintext"). Note: hashing happens in the browser for this demo build
// because there is no backend to hash on - in a real deployment the
// server would hash+salt on account creation (e.g. bcrypt/argon2) and
// verify server-side; a purely client-side hash is still visible to
// anyone reading the JS bundle, so this is a correctness/architecture
// demonstration, not a substitute for real server-side auth.
export async function sha256Hex(text) {
  const encoded = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Session security: idle sessions and stale tokens are both logged out
// automatically (FR-01 "Session/token management").
export const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours
export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// Failed-login lockout (FR-01 "Failed login protection").
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds
