import api, { apiRequest } from './axiosInstance';

export const getByShipment = (shipmentId) => apiRequest(api.get(`/shipments/${shipmentId}/pod`));
export const create = (shipmentId, payload) => apiRequest(api.post(`/shipments/${shipmentId}/pod`, payload));
export const uploadPhoto = (shipmentId, payload) => apiRequest(api.post(`/shipments/${shipmentId}/pod/photo`, payload, { headers: { 'Content-Type': 'multipart/form-data' } }));
export const verifyOtp = (shipmentId, otp) => apiRequest(api.post(`/shipments/${shipmentId}/pod/verify-otp`, { otp }));
export const updateSignature = (shipmentId, signature) => apiRequest(api.patch(`/shipments/${shipmentId}/pod/signature`, { signature }));

export default { getByShipment, create, uploadPhoto, verifyOtp, updateSignature };
