import api, { apiRequest } from './axiosInstance';

export const listTickets = (params) => apiRequest(api.get('/support/tickets', { params }));
export const getTicket = (id) => apiRequest(api.get(`/support/tickets/${id}`));
export const createTicket = (payload) => apiRequest(api.post('/support/tickets', payload));
export const updateTicket = (id, payload) => apiRequest(api.put(`/support/tickets/${id}`, payload));
export const replyToTicket = (id, payload) => apiRequest(api.post(`/support/tickets/${id}/replies`, payload));
export const closeTicket = (id, payload) => apiRequest(api.post(`/support/tickets/${id}/close`, payload));
export const listComplaints = (params) => apiRequest(api.get('/support/complaints', { params }));
export const createComplaint = (payload) => apiRequest(api.post('/support/complaints', payload));
export const updateComplaint = (id, payload) => apiRequest(api.put(`/support/complaints/${id}`, payload));
export const rateTicket = (id, rating, comment) => apiRequest(api.post(`/support/tickets/${id}/rating`, { rating, comment }));

export default { listTickets, getTicket, createTicket, updateTicket, replyToTicket, closeTicket, listComplaints, createComplaint, updateComplaint, rateTicket };
