import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/branches', { params }));
export const getById = (id) => apiRequest(api.get(`/branches/${id}`));
export const create = (payload) => apiRequest(api.post('/branches', payload));
export const update = (id, payload) => apiRequest(api.put(`/branches/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/branches/${id}`));
export const inventory = (id, params) => apiRequest(api.get(`/branches/${id}/inventory`, { params }));
export const staff = (id, params) => apiRequest(api.get(`/branches/${id}/staff`, { params }));

export default { list, getById, create, update, remove, inventory, staff };
