import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/audit-logs', { params }));
export const getById = (id) => apiRequest(api.get(`/audit-logs/${id}`));
export const exportLogs = (params) => apiRequest(api.get('/audit-logs/export', { params, responseType: 'blob' }));
export const getSummary = (params) => apiRequest(api.get('/audit-logs/summary', { params }));

export default { list, getById, exportLogs, getSummary };
