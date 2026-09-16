import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/manifests', { params }));
export const getById = (id) => apiRequest(api.get(`/manifests/${id}`));
export const create = (payload) => apiRequest(api.post('/manifests', payload));
export const update = (id, payload) => apiRequest(api.put(`/manifests/${id}`, payload));
export const close = (id, payload) => apiRequest(api.post(`/manifests/${id}/close`, payload));
export const scan = (id, payload) => apiRequest(api.post(`/manifests/${id}/scan`, payload));
export const shipments = (id, params) => apiRequest(api.get(`/manifests/${id}/shipments`, { params }));

export default { list, getById, create, update, close, scan, shipments };
