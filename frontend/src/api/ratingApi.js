import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/ratings', { params }));
export const getById = (id) => apiRequest(api.get(`/ratings/${id}`));
export const create = (payload) => apiRequest(api.post('/ratings', payload));
export const update = (id, payload) => apiRequest(api.put(`/ratings/${id}`, payload));
export const shipmentRating = (shipmentId) => apiRequest(api.get(`/shipments/${shipmentId}/rating`));
export const driverRating = (driverId, params) => apiRequest(api.get(`/drivers/${driverId}/ratings`, { params }));

export default { list, getById, create, update, shipmentRating, driverRating };
