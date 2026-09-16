import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/hubs', { params }));
export const getById = (id) => apiRequest(api.get(`/hubs/${id}`));
export const create = (payload) => apiRequest(api.post('/hubs', payload));
export const update = (id, payload) => apiRequest(api.put(`/hubs/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/hubs/${id}`));
export const capacity = (id, params) => apiRequest(api.get(`/hubs/${id}/capacity`, { params }));
export const scan = (id, payload) => apiRequest(api.post(`/hubs/${id}/scan`, payload));

export default { list, getById, create, update, remove, capacity, scan };
