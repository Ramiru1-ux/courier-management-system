import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/payments', { params }));
export const getById = (id) => apiRequest(api.get(`/payments/${id}`));
export const create = (payload) => apiRequest(api.post('/payments', payload));
export const confirm = (id, payload) => apiRequest(api.post(`/payments/${id}/confirm`, payload));
export const refund = (id, payload) => apiRequest(api.post(`/payments/${id}/refund`, payload));
export const methods = () => apiRequest(api.get('/payments/methods'));

export default { list, getById, create, confirm, refund, methods };
