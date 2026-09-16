import api, { apiRequest } from './axiosInstance';

export const getSummary = (params) => apiRequest(api.get('/dashboard/summary', { params }));
export const getKpis = (params) => apiRequest(api.get('/dashboard/kpis', { params }));
export const getRecentActivity = (params) => apiRequest(api.get('/dashboard/activity', { params }));
export const getShipmentOverview = (params) => apiRequest(api.get('/dashboard/shipments', { params }));
export const getRevenueOverview = (params) => apiRequest(api.get('/dashboard/revenue', { params }));

export default { getSummary, getKpis, getRecentActivity, getShipmentOverview, getRevenueOverview };
