/**
 * Server-side login lockout, tracked per account (by email).
 *
 * The frontend (frontend/src/utils/authSecurity.js) already displays a
 * "too many attempts, locked for N seconds" message after 5 failed tries,
 * but that counter lives only in the browser - calling POST /api/auth/login
 * directly bypasses it completely. This makes the same protection real on
 * the server, which is the only place it cannot be bypassed by disabling
 * JavaScript or clearing frontend state.
 *
 * Deliberately a simple in-memory Map, matching the existing
 * middleware/rateLimiter.js pattern already used in this project - no new
 * infrastructure (Redis, a database table, etc.) for a single-process app.
 * The tradeoff is that counters reset on server restart and do not share
 * state across multiple server instances; both are acceptable for this
 * project's scale and match its existing rate limiter's same tradeoff.
 */

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 1000; // matches the frontend's existing LOCKOUT_DURATION_MS

const attempts = new Map(); // normalized email -> { count, lockedUntil }

/** How many seconds until `email` may try again, or 0 if not locked. */
function getLockoutSecondsRemaining(email) {
	const key = String(email || "").trim().toLowerCase();
	const state = attempts.get(key);
	if (!state) return 0;

	if (state.lockedUntil && Date.now() >= state.lockedUntil) {
		// Lockout period has passed - the account gets a clean slate rather
		// than staying flagged forever (avoids a permanent lockout).
		attempts.delete(key);
		return 0;
	}

	return state.lockedUntil ? Math.max(0, Math.ceil((state.lockedUntil - Date.now()) / 1000)) : 0;
}

/** Call after a failed login attempt (wrong password OR unknown email - both
 * are recorded identically so a lockout can never reveal which one happened). */
function recordFailedLogin(email) {
	const key = String(email || "").trim().toLowerCase();
	if (!key) return;
	const state = attempts.get(key) || { count: 0, lockedUntil: 0 };
	state.count += 1;
	if (state.count >= MAX_ATTEMPTS) {
		state.lockedUntil = Date.now() + LOCKOUT_MS;
		state.count = 0; // fresh count once the next lockout window starts
	}
	attempts.set(key, state);
}

/** Call after a successful login - a legitimate sign-in clears the slate. */
function clearFailedLogins(email) {
	const key = String(email || "").trim().toLowerCase();
	attempts.delete(key);
}

module.exports = { MAX_ATTEMPTS, LOCKOUT_MS, getLockoutSecondsRemaining, recordFailedLogin, clearFailedLogins };
