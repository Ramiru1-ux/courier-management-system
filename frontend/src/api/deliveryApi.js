import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/deliveries', { params }));
export const getById = (id) => apiRequest(api.get(`/deliveries/${id}`));
export const assign = (id, payload) => apiRequest(api.post(`/deliveries/${id}/assign`, payload));
export const attempt = (id, payload) => apiRequest(api.post(`/deliveries/${id}/attempt`, payload));
export const confirm = (id, payload) => apiRequest(api.post(`/deliveries/${id}/confirm`, payload));
export const fail = (id, payload) => apiRequest(api.post(`/deliveries/${id}/failed`, payload));
export const reschedule = (id, payload) => apiRequest(api.post(`/deliveries/${id}/reschedule`, payload));

export default { list, getById, assign, attempt, confirm, fail, reschedule };
