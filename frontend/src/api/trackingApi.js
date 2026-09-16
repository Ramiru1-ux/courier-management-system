import api, { apiRequest } from './axiosInstance';

export const getByTrackingNumber = (trackingNumber) => apiRequest(api.get(`/tracking/${encodeURIComponent(trackingNumber)}`));
export const getTimeline = (trackingNumber, params) => apiRequest(api.get(`/tracking/${encodeURIComponent(trackingNumber)}/timeline`, { params }));
export const getLive = (params) => apiRequest(api.get('/tracking/live', { params }));
export const addEvent = (trackingNumber, payload) => apiRequest(api.post(`/tracking/${encodeURIComponent(trackingNumber)}/events`, payload));
// Both public - no auth token is attached/needed (see axiosInstance.js,
// which only adds Authorization when a stored token exists). Used by the
// customer portal's tracking result to file a complaint or, once
// DELIVERED, a review - without ever requiring a customer account.
export const submitComplaint = (trackingNumber, payload) => apiRequest(api.post(`/tracking/${encodeURIComponent(trackingNumber)}/complaint`, payload));
export const submitReview = (trackingNumber, payload) => apiRequest(api.post(`/tracking/${encodeURIComponent(trackingNumber)}/review`, payload));

export default { getByTrackingNumber, getTimeline, getLive, addEvent, submitComplaint, submitReview };
