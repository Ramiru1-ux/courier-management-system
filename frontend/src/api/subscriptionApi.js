import api, { apiRequest } from './axiosInstance';

export const listPlans = (params) => apiRequest(api.get('/subscriptions/plans', { params }));
export const getPlan = (id) => apiRequest(api.get(`/subscriptions/plans/${id}`));
export const createPlan = (payload) => apiRequest(api.post('/subscriptions/plans', payload));
export const updatePlan = (id, payload) => apiRequest(api.put(`/subscriptions/plans/${id}`, payload));
export const list = (params) => apiRequest(api.get('/subscriptions', { params }));
export const getById = (id) => apiRequest(api.get(`/subscriptions/${id}`));
export const subscribe = (payload) => apiRequest(api.post('/subscriptions', payload));
export const cancel = (id, reason) => apiRequest(api.post(`/subscriptions/${id}/cancel`, { reason }));

export default { listPlans, getPlan, createPlan, updatePlan, list, getById, subscribe, cancel };
