import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/drivers', { params }));
export const getById = (id) => apiRequest(api.get(`/drivers/${id}`));
export const create = (payload) => apiRequest(api.post('/drivers', payload));
export const update = (id, payload) => apiRequest(api.put(`/drivers/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/drivers/${id}`));
export const availability = (id, status) => apiRequest(api.patch(`/drivers/${id}/availability`, { status }));
export const location = (id, payload) => apiRequest(api.patch(`/drivers/${id}/location`, payload));
export const performance = (id, params) => apiRequest(api.get(`/drivers/${id}/performance`, { params }));

export default { list, getById, create, update, remove, availability, location, performance };
