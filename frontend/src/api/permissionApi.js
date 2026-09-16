import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/permissions', { params }));
export const getById = (id) => apiRequest(api.get(`/permissions/${id}`));
export const create = (payload) => apiRequest(api.post('/permissions', payload));
export const update = (id, payload) => apiRequest(api.put(`/permissions/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/permissions/${id}`));
export const matrix = (params) => apiRequest(api.get('/permissions/matrix', { params }));
export const updateMatrix = (payload) => apiRequest(api.put('/permissions/matrix', payload));

export default { list, getById, create, update, remove, matrix, updateMatrix };
