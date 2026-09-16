import api, { apiRequest } from './axiosInstance';

// Real geocoding via backend/services/geocodingService.js (OpenStreetMap
// Nominatim - free, keyless, the same provider the app's map tiles already
// use). Returns { resolved: false } for an address that could not be found
// - never a fabricated coordinate.
export const geocodeAddress = (address) => apiRequest(api.get('/geocode', { params: { address } }));

export default { geocodeAddress };
