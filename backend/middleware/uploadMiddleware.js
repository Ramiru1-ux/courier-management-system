const { upload } = require("../config/multerConfig");

const uploadSingle = (fieldName = "file") => upload.single(fieldName);
const uploadArray = (fieldName = "files", maxCount = 10) => upload.array(fieldName, maxCount);
const uploadFields = (fields = []) => upload.fields(fields);
const uploadAny = () => upload.any();

const handleUploadError = (error, req, res, next) => {
	if (!error) return next();
	return res.status(400).json({
		success: false,
		message: error.message || "File upload failed",
	});
};

module.exports = {
	upload,
	uploadSingle,
	uploadArray,
	uploadFields,
	uploadAny,
	handleUploadError,
};
