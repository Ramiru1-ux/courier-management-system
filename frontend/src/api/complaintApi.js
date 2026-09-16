import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/complaints', { params }));
export const getById = (id) => apiRequest(api.get(`/complaints/${id}`));
export const create = (payload) => apiRequest(api.post('/complaints', payload));
export const update = (id, payload) => apiRequest(api.put(`/complaints/${id}`, payload));
export const assign = (id, payload) => apiRequest(api.post(`/complaints/${id}/assign`, payload));
export const resolve = (id, payload) => apiRequest(api.post(`/complaints/${id}/resolve`, payload));
export const addNote = (id, payload) => apiRequest(api.post(`/complaints/${id}/notes`, payload));

export default { list, getById, create, update, assign, resolve, addNote };
