import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/addresses', { params }));
export const getById = (id) => apiRequest(api.get(`/addresses/${id}`));
export const create = (payload) => apiRequest(api.post('/addresses', payload));
export const update = (id, payload) => apiRequest(api.put(`/addresses/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/addresses/${id}`));
export const validate = (payload) => apiRequest(api.post('/addresses/validate', payload));

export default { list, getById, create, update, remove, validate };
