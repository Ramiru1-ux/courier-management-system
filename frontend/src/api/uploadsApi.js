import api, { apiRequest } from './axiosInstance';

/** Uploads a real proof-of-delivery photo to the backend (multer, disk
 * storage) and returns its server URL - see backend/routes/uploadsRoutes.js.
 * Previously PodCapturePage.jsx only stored the local File object's `.name`
 * string in the podRecords blob, never the actual image bytes. */
export const uploadPodPhoto = (file) => {
	const formData = new FormData();
	formData.append('photo', file);
	return apiRequest(api.post('/uploads/pod-photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }));
};

export default { uploadPodPhoto };
