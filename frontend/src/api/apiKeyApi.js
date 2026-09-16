import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/api-keys', { params }));
export const getById = (id) => apiRequest(api.get(`/api-keys/${id}`));
export const create = (payload) => apiRequest(api.post('/api-keys', payload));
export const revoke = (id, reason) => apiRequest(api.post(`/api-keys/${id}/revoke`, { reason }));
export const rotate = (id) => api.post(`/api-keys/${id}/rotate`).then((response) => response.data);

export default { list, getById, create, revoke, rotate };
