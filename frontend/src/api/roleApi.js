import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/roles', { params }));
export const getById = (id) => apiRequest(api.get(`/roles/${id}`));
export const create = (payload) => apiRequest(api.post('/roles', payload));
export const update = (id, payload) => apiRequest(api.put(`/roles/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/roles/${id}`));
export const permissions = (id) => apiRequest(api.get(`/roles/${id}/permissions`));
export const updatePermissions = (id, payload) => apiRequest(api.put(`/roles/${id}/permissions`, payload));

export default { list, getById, create, update, remove, permissions, updatePermissions };
