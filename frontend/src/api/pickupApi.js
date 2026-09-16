import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/pickups', { params }));
export const getById = (id) => apiRequest(api.get(`/pickups/${id}`));
export const create = (payload) => apiRequest(api.post('/pickups', payload));
export const update = (id, payload) => apiRequest(api.put(`/pickups/${id}`, payload));
export const cancel = (id, reason) => apiRequest(api.post(`/pickups/${id}/cancel`, { reason }));
export const assign = (id, payload) => apiRequest(api.post(`/pickups/${id}/assign`, payload));
export const reschedule = (id, payload) => apiRequest(api.post(`/pickups/${id}/reschedule`, payload));

export default { list, getById, create, update, cancel, assign, reschedule };
