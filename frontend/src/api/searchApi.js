import api, { apiRequest } from './axiosInstance';

export const globalSearch = (query, params = {}) => apiRequest(api.get('/search', { params: { q: query, ...params } }));
export const shipments = (query, params = {}) => apiRequest(api.get('/search/shipments', { params: { q: query, ...params } }));
export const customers = (query, params = {}) => apiRequest(api.get('/search/customers', { params: { q: query, ...params } }));
export const drivers = (query, params = {}) => apiRequest(api.get('/search/drivers', { params: { q: query, ...params } }));

export default { globalSearch, shipments, customers, drivers };
