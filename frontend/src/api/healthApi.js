import api from './axiosInstance';

/**
 * Asks the backend what the REAL state of the database is.
 *
 * GET /api/health is deliberately unauthenticated, cheap, and mounted under
 * /api so the Vite dev proxy forwards it (the older /health sits outside /api
 * and the browser could never reach it). It answers 200 when MongoDB is
 * connected and 503 when it is not - so the UI can tell three different
 * failures apart instead of calling all of them "not connected":
 *
 *   - the probe itself fails       -> the backend is not reachable
 *   - it answers 503               -> backend is up, database is not
 *   - it answers 200               -> both are fine; the request that failed
 *                                     did so for some other reason
 *
 * Given a short timeout of its own: this runs after something has already
 * gone wrong, so it must not make the user wait another 20 seconds.
 */
export const getHealth = async () => {
  const response = await api.get('/health', {
    timeout: 6000,
    // 503 is a real, useful answer here, not an exception.
    validateStatus: (status) => status === 200 || status === 503,
  });
  return response.data;
};

export default { getHealth };
