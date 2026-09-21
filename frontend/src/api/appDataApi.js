import api, { apiRequest } from './axiosInstance';

// Talks to backend/routes/appDataRoutes.js. Every list the UI shows is
// stored in its own MongoDB collection (cms_shipments, cms_drivers, ...).
export const getAll = () => apiRequest(api.get('/app-data'));
// `asOf` is the server time this client's snapshot was read (returned by
// getAll and by every save). The server needs it to tell which records this
// snapshot can still speak for - see reconcileShipmentWrite() in
// backend/controllers/appDataController.js.
export const saveAll = (data, asOf) => apiRequest(api.put('/app-data', { data, asOf }));
export const getEntity = (entity) => apiRequest(api.get(`/app-data/${entity}`));
export const saveEntity = (entity, items) => apiRequest(api.put(`/app-data/${entity}`, { data: items }));
export const getCollectionMap = () => apiRequest(api.get('/app-data/meta/collections'));
// The merchant's failed / RTO shipments and the count behind their dashboard
// card. The count is computed by MongoDB, and ownership is enforced inside
// the query itself - see getFailedRtoShipments in
// backend/controllers/appDataController.js. Staff may pass a merchant name;
// for a merchant account the server ignores it and pins to their own.
export const getFailedRtoShipments = (merchant) => apiRequest(
  api.get('/app-data/shipments/failed-rto', { params: merchant ? { merchant } : undefined }),
);
export const testWebhook = (webhookId) => apiRequest(api.post(`/app-data/webhooks/${webhookId}/test`));
export const updateDriverLocation = (driverId, { lat, lng, accuracy }) => apiRequest(api.put(`/app-data/drivers/${driverId}/location`, { lat, lng, accuracy }));
export const dispatchNotification = (notificationId) => apiRequest(api.post(`/app-data/notifications/${notificationId}/dispatch`));
// Driver's own operational availability (Available/Offline) - a narrow,
// ownership-checked endpoint distinct from the blob's normal drivers-list
// write path (which is staff-only). See updateDriverAvailability() in
// backend/controllers/appDataController.js.
export const updateDriverAvailability = (driverId, availability) => apiRequest(api.put(`/app-data/drivers/${driverId}/availability`, { availability }));

export default { getAll, saveAll, getEntity, saveEntity, getCollectionMap, getFailedRtoShipments, testWebhook, updateDriverLocation, dispatchNotification, updateDriverAvailability };
