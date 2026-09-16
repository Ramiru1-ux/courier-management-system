import api, { apiRequest } from './axiosInstance';

export const list = (params) => apiRequest(api.get('/notifications', { params }));
export const getUnreadCount = () => apiRequest(api.get('/notifications/unread-count'));
export const markRead = (id) => apiRequest(api.patch(`/notifications/${id}/read`));
export const markAllRead = () => apiRequest(api.patch('/notifications/read-all'));
export const listTemplates = (params) => apiRequest(api.get('/notification-templates', { params }));
export const createTemplate = (payload) => apiRequest(api.post('/notification-templates', payload));
export const updateTemplate = (id, payload) => apiRequest(api.put(`/notification-templates/${id}`, payload));
export const deleteTemplate = (id) => apiRequest(api.delete(`/notification-templates/${id}`));

export default { list, getUnreadCount, markRead, markAllRead, listTemplates, createTemplate, updateTemplate, deleteTemplate };
