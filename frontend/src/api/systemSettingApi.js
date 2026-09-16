import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/system-settings', { params }));
export const get = (key) => apiRequest(api.get(`/system-settings/${encodeURIComponent(key)}`));
export const update = (key, value) => apiRequest(api.put(`/system-settings/${encodeURIComponent(key)}`, { value }));
export const updateMany = (payload) => apiRequest(api.put('/system-settings', payload));
export const reset = (key) => apiRequest(api.post(`/system-settings/${encodeURIComponent(key)}/reset`));

export default { list, get, update, updateMany, reset };
