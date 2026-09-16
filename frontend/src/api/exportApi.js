import api, { apiRequest } from './axiosInstance';

export const shipments = (params) => apiRequest(api.get('/exports/shipments', { params, responseType: 'blob' }));
export const payments = (params) => apiRequest(api.get('/exports/payments', { params, responseType: 'blob' }));
export const settlements = (params) => apiRequest(api.get('/exports/settlements', { params, responseType: 'blob' }));
export const auditLogs = (params) => apiRequest(api.get('/exports/audit-logs', { params, responseType: 'blob' }));
export const report = (type, params) => apiRequest(api.get(`/exports/reports/${type}`, { params, responseType: 'blob' }));

export default { shipments, payments, settlements, auditLogs, report };
