import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/customers', { params }));
export const getById = (id) => apiRequest(api.get(`/customers/${id}`));
export const create = (payload) => apiRequest(api.post('/customers', payload));
export const update = (id, payload) => apiRequest(api.put(`/customers/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/customers/${id}`));
export const shipmentHistory = (id, params) => apiRequest(api.get(`/customers/${id}/shipments`, { params }));
export const addresses = (id) => apiRequest(api.get(`/customers/${id}/addresses`));
export const addAddress = (id, payload) => apiRequest(api.post(`/customers/${id}/addresses`, payload));

export default { list, getById, create, update, remove, shipmentHistory, addresses, addAddress };
