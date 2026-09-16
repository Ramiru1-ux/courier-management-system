import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/routes', { params }));
export const getById = (id) => apiRequest(api.get(`/routes/${id}`));
export const create = (payload) => apiRequest(api.post('/routes', payload));
export const update = (id, payload) => apiRequest(api.put(`/routes/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/routes/${id}`));
export const optimize = (payload) => apiRequest(api.post('/routes/optimize', payload));
export const assign = (id, payload) => apiRequest(api.post(`/routes/${id}/assign`, payload));
export const stops = (id, params) => apiRequest(api.get(`/routes/${id}/stops`, { params }));

export default { list, getById, create, update, remove, optimize, assign, stops };
