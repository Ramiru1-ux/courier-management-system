import api, { apiRequest } from './axiosInstance';

export const getOverview = (params) => apiRequest(api.get('/dispatch/overview', { params }));
export const list = (params) => apiRequest(api.get('/dispatch', { params }));
export const create = (payload) => apiRequest(api.post('/dispatch', payload));
export const getById = (id) => apiRequest(api.get(`/dispatch/${id}`));
export const assign = (id, payload) => apiRequest(api.post(`/dispatch/${id}/assign`, payload));
export const start = (id) => apiRequest(api.post(`/dispatch/${id}/start`));
export const complete = (id, payload) => apiRequest(api.post(`/dispatch/${id}/complete`, payload));
export const optimize = (payload) => apiRequest(api.post('/dispatch/optimize', payload));

export default { getOverview, list, create, getById, assign, start, complete, optimize };
