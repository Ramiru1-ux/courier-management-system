import api, { apiRequest } from './axiosInstance';

export const listRules = (params) => apiRequest(api.get('/pricing/rules', { params }));
export const getRule = (id) => apiRequest(api.get(`/pricing/rules/${id}`));
export const createRule = (payload) => apiRequest(api.post('/pricing/rules', payload));
export const updateRule = (id, payload) => apiRequest(api.put(`/pricing/rules/${id}`, payload));
export const deleteRule = (id) => apiRequest(api.delete(`/pricing/rules/${id}`));
export const calculate = (payload) => apiRequest(api.post('/pricing/calculate', payload));
export const serviceability = (postalCode) => apiRequest(api.get('/pricing/serviceability', { params: { postalCode } }));

export default { listRules, getRule, createRule, updateRule, deleteRule, calculate, serviceability };
