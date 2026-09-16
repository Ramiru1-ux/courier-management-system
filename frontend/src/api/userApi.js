import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/users', { params }));
export const getById = (id) => apiRequest(api.get(`/users/${id}`));
export const create = (payload) => apiRequest(api.post('/users', payload));
export const update = (id, payload) => apiRequest(api.put(`/users/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/users/${id}`));
export const updateStatus = (id, status) => apiRequest(api.patch(`/users/${id}/status`, { status }));
export const assignRole = (id, roleId) => apiRequest(api.patch(`/users/${id}/role`, { roleId }));
export const invite = (payload) => apiRequest(api.post('/users/invite', payload));

export default { list, getById, create, update, remove, updateStatus, assignRole, invite };
