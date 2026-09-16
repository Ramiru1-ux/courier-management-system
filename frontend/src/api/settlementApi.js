import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/settlements', { params }));
export const getById = (id) => apiRequest(api.get(`/settlements/${id}`));
export const create = (payload) => apiRequest(api.post('/settlements', payload));
export const approve = (id, payload) => apiRequest(api.post(`/settlements/${id}/approve`, payload));
export const reject = (id, reason) => apiRequest(api.post(`/settlements/${id}/reject`, { reason }));
export const exportReport = (params) => apiRequest(api.get('/settlements/export', { params, responseType: 'blob' }));

export default { list, getById, create, approve, reject, exportReport };
