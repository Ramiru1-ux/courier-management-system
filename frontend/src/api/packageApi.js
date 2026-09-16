import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/packages', { params }));
export const getById = (id) => apiRequest(api.get(`/packages/${id}`));
export const create = (payload) => apiRequest(api.post('/packages', payload));
export const update = (id, payload) => apiRequest(api.put(`/packages/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/packages/${id}`));
export const addItem = (id, payload) => apiRequest(api.post(`/packages/${id}/items`, payload));
export const updateItem = (id, itemId, payload) => apiRequest(api.put(`/packages/${id}/items/${itemId}`, payload));

export default { list, getById, create, update, remove, addItem, updateItem };
