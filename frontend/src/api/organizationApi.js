import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/organizations', { params }));
export const getById = (id) => apiRequest(api.get(`/organizations/${id}`));
export const create = (payload) => apiRequest(api.post('/organizations', payload));
export const update = (id, payload) => apiRequest(api.put(`/organizations/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/organizations/${id}`));
export const users = (id, params) => apiRequest(api.get(`/organizations/${id}/users`, { params }));
export const branches = (id, params) => apiRequest(api.get(`/organizations/${id}/branches`, { params }));
export const updatePlan = (id, payload) => apiRequest(api.patch(`/organizations/${id}/subscription`, payload));

export default { list, getById, create, update, remove, users, branches, updatePlan };
