import api, { apiRequest } from './axiosInstance';

export const login = (payload) => apiRequest(api.post('/auth/login', payload));
export const register = (payload) => apiRequest(api.post('/auth/register', payload));
export const logout = () => apiRequest(api.post('/auth/logout'));
export const refreshToken = (payload) => apiRequest(api.post('/auth/refresh', payload));
export const forgotPassword = (email) => apiRequest(api.post('/auth/forgot-password', { email }));
export const resetPassword = (payload) => apiRequest(api.post('/auth/reset-password', payload));
export const verifyTwoFactor = (payload) => apiRequest(api.post('/auth/2fa/verify', payload));
export const resendTwoFactor = (payload) => apiRequest(api.post('/auth/2fa/resend', payload));
export const getCurrentUser = () => apiRequest(api.get('/auth/me'));
export const updateProfile = (payload) => apiRequest(api.patch('/auth/me', payload));

export default { login, register, logout, refreshToken, forgotPassword, resetPassword, verifyTwoFactor, resendTwoFactor, getCurrentUser, updateProfile };
