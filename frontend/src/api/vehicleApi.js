import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/vehicles', { params }));
export const getById = (id) => apiRequest(api.get(`/vehicles/${id}`));
export const create = (payload) => apiRequest(api.post('/vehicles', payload));
export const update = (id, payload) => apiRequest(api.put(`/vehicles/${id}`, payload));
export const remove = (id) => apiRequest(api.delete(`/vehicles/${id}`));
export const maintenance = (id, payload) => apiRequest(api.post(`/vehicles/${id}/maintenance`, payload));
export const maintenanceHistory = (id, params) => apiRequest(api.get(`/vehicles/${id}/maintenance`, { params }));

export default { list, getById, create, update, remove, maintenance, maintenanceHistory };
