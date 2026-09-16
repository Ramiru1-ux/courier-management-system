import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/zones', { params }));
export const getById = (id) => apiRequest(api.get(`/zones/${id}`));
export const create = (payload) => apiRequest(api.post('/zones', payload));
export const update = (id, payload) => apiRequest(api.put(`/zones/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/zones/${id}`));
export const serviceability = (postalCode) => apiRequest(api.get('/zones/serviceability', { params: { postalCode } }));
export const coverage = (id, params) => apiRequest(api.get(`/zones/${id}/coverage`, { params }));

export default { list, getById, create, update, remove, serviceability, coverage };
