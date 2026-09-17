import api, { apiRequest } from './axiosInstance';

export const login = (payload) => apiRequest(api.post('/auth/login', payload));
export const register = (payload) => apiRequest(api.post('/auth/register', payload));
export const deleteUserByEmail = (email) => apiRequest(api.delete(`/auth/users/by-email/${encodeURIComponent(email)}`));
// The token is passed in explicitly: AuthContext clears it from storage right
// after calling this, before the request interceptor would get to read it.
export const logout = (token, reason = 'manual') => apiRequest(api.post('/auth/logout',{ reason },token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,));
export const refreshToken = (payload) => apiRequest(api.post('/auth/refresh', payload));
export const forgotPassword = (email) => apiRequest(api.post('/auth/forgot-password', { email }));
export const resetPassword = (payload) => apiRequest(api.post('/auth/reset-password', payload));
export const verifyTwoFactor = (payload) => apiRequest(api.post('/auth/2fa/verify', payload));
export const resendTwoFactor = (payload) => apiRequest(api.post('/auth/2fa/resend', payload));
export const getCurrentUser = () => apiRequest(api.get('/auth/me'));
export const updateProfile = (payload) => apiRequest(api.patch('/auth/me', payload));

export default { login, register, deleteUserByEmail, logout, refreshToken, forgotPassword, resetPassword, verifyTwoFactor, resendTwoFactor, getCurrentUser, updateProfile };