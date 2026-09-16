import api, { apiRequest } from './axiosInstance';

export const operational = (params) => apiRequest(api.get('/reports/operational', { params }));
export const driver = (params) => apiRequest(api.get('/reports/drivers', { params }));
export const merchant = (params) => apiRequest(api.get('/reports/merchants', { params }));
export const branch = (params) => apiRequest(api.get('/reports/branches', { params }));
export const financial = (params) => apiRequest(api.get('/reports/financial', { params }));
export const exportReport = (type, params) => apiRequest(api.get(`/reports/${type}/export`, { params, responseType: 'blob' }));

export default { operational, driver, merchant, branch, financial, exportReport };
