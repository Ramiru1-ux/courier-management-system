import axios from 'axios';
import { getStoredToken } from '../utils/session';

// In development `/api` is proxied to the Express server on port 5000 by
// vite.config.js, so no CORS setup is needed. Set VITE_API_URL in .env to
// point at a deployed backend instead.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
	headers: { 'Content-Type': 'application/json' },
	timeout: 20000,
});

axiosInstance.interceptors.request.use((config) => {
	// Keep a token the request already set itself (logout sends the token of
	// the session being closed, which is no longer in storage by then).
	if (!config.headers.Authorization) {
		const token = getStoredToken();
		if (token) config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		const response = error.response;
		const message = response?.data?.message
			|| (error.code === 'ERR_NETWORK' ? 'Cannot reach the server. Is the backend running on port 5000?' : null)
			|| error.message
			|| 'Request failed';
		return Promise.reject(Object.assign(new Error(message), {
			status: response?.status,
			data: response?.data,
			originalError: error,
		}));
	},
);

export const apiRequest = async (request) => (await request).data;
export const configureApiClient = ({ baseURL, timeout } = {}) => {
	if (baseURL) axiosInstance.defaults.baseURL = baseURL;
	if (timeout) axiosInstance.defaults.timeout = timeout;
	return axiosInstance;
};
export default axiosInstance;
