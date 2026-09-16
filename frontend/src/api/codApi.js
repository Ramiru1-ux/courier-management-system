import api, { apiRequest } from './axiosInstance';

export const listTransactions = (params) => apiRequest(api.get('/cod/transactions', { params }));
export const getTransaction = (id) => apiRequest(api.get(`/cod/transactions/${id}`));
export const recordCollection = (payload) => apiRequest(api.post('/cod/collections', payload));
export const reconcile = (id, payload) => apiRequest(api.post(`/cod/transactions/${id}/reconcile`, payload));
export const getSummary = (params) => apiRequest(api.get('/cod/summary', { params }));
export const requestSettlement = (payload) => apiRequest(api.post('/cod/settlements', payload));

export default { listTransactions, getTransaction, recordCollection, reconcile, getSummary, requestSettlement };
