/**
 * Real geocoding via OpenStreetMap Nominatim (nominatim.openstreetmap.org) -
 * free and keyless, so this needs no new environment credentials. The app
 * already depends on OpenStreetMap for its map tiles (see
 * dispatcher/LiveTrackingPage.jsx's <TileLayer>), so this is the same data
 * provider, not a new external dependency to manage.
 *
 * Nominatim's usage policy requires a real identifying User-Agent and caps
 * usage at roughly one request per second - enforced here with a simple
 * request queue (never more than one in-flight Nominatim call, spaced by at
 * least 1.1s) shared across every caller, regardless of how many users hit
 * the /api/geocode route at once. An in-memory cache (by normalized
 * address, process lifetime only) means the same address is only ever sent
 * to Nominatim once.
 */
const cache = new Map();
let queue = Promise.resolve();
let lastRequestAt = 0;
const MIN_INTERVAL_MS = 1100;

function normalize(address) {
	return String(address || "").trim().toLowerCase().replace(/\s+/g, " ");
}

async function throttledFetch(url) {
	queue = queue.then(async () => {
		const wait = Math.max(0, lastRequestAt + MIN_INTERVAL_MS - Date.now());
		if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
		lastRequestAt = Date.now();
	});
	await queue;
	return fetch(url, { headers: { "User-Agent": "CourierManagementSystem/1.0 (internal delivery route mapping)" } });
}

/** Returns {lat, lng} for a real address via Nominatim, or null if it
 * could not be resolved. Never fabricates a coordinate - a failed or
 * ambiguous lookup returns null, which the caller must handle honestly
 * (e.g. by leaving that stop off the map, not by guessing). */
async function geocodeAddress(address) {
	const key = normalize(address);
	if (!key) return null;
	if (cache.has(key)) return cache.get(key);

	const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
	try {
		const response = await throttledFetch(url);
		if (!response.ok) {
			cache.set(key, null);
			return null;
		}
		const results = await response.json();
		const first = Array.isArray(results) ? results[0] : null;
		const result = first ? { lat: Number(first.lat), lng: Number(first.lon) } : null;
		cache.set(key, result);
		return result;
	} catch (error) {
		// Network failure, Nominatim unavailable, etc. - report "unresolved",
		// never a fabricated point.
		return null;
	}
}

module.exports = { geocodeAddress };
