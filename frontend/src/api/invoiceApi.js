import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/invoices', { params }));
export const getById = (id) => apiRequest(api.get(`/invoices/${id}`));
export const create = (payload) => apiRequest(api.post('/invoices', payload));
export const send = (id, payload) => apiRequest(api.post(`/invoices/${id}/send`, payload));
export const download = (id) => apiRequest(api.get(`/invoices/${id}/download`, { responseType: 'blob' }));
export const markPaid = (id, payload) => apiRequest(api.post(`/invoices/${id}/paid`, payload));

export default { list, getById, create, send, download, markPaid };
