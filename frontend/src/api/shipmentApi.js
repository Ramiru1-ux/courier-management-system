import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/shipments', { params }));
export const getById = (id) => apiRequest(api.get(`/shipments/${id}`));
export const create = (payload) => apiRequest(api.post('/shipments', payload));
export const update = (id, payload) => apiRequest(api.put(`/shipments/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/shipments/${id}`));
export const updateStatus = (id, status, notes) => apiRequest(api.patch(`/shipments/${id}/status`, { status, notes }));
export const track = (trackingNumber) => apiRequest(api.get(`/shipments/track/${encodeURIComponent(trackingNumber)}`));
export const bulkCreate = (payload) => apiRequest(api.post('/shipments/bulk', payload, { headers: { 'Content-Type': 'multipart/form-data' } }));

export default { list, getById, create, update, remove, updateStatus, track, bulkCreate };
