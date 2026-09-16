import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/merchants', { params }));
export const getById = (id) => apiRequest(api.get(`/merchants/${id}`));
export const create = (payload) => apiRequest(api.post('/merchants', payload));
export const update = (id, payload) => apiRequest(api.put(`/merchants/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/merchants/${id}`));
export const dashboard = (id, params) => apiRequest(api.get(`/merchants/${id}/dashboard`, { params }));
export const settlements = (id, params) => apiRequest(api.get(`/merchants/${id}/settlements`, { params }));

export default { list, getById, create, update, remove, dashboard, settlements };
