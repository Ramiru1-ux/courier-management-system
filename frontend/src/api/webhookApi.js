import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/webhooks', { params }));
export const getById = (id) => apiRequest(api.get(`/webhooks/${id}`));
export const create = (payload) => apiRequest(api.post('/webhooks', payload));
export const update = (id, payload) => apiRequest(api.put(`/webhooks/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/webhooks/${id}`));
export const test = (id, payload) => apiRequest(api.post(`/webhooks/${id}/test`, payload));
export const deliveries = (id, params) => apiRequest(api.get(`/webhooks/${id}/deliveries`, { params }));

export default { list, getById, create, update, remove, test, deliveries };
