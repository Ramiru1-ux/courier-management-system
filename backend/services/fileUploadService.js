const cloudinary = require("../config/cloudinaryConfig");
const uploadFile = async (file, options = {}) => { if (!file) throw new Error("File is required"); if (file.path && cloudinary.uploader?.upload) return cloudinary.uploader.upload(file.path, options); return { secure_url: file.location || file.path, originalName: file.originalname, mimetype: file.mimetype, size: file.size }; };
const deleteFile = (publicId) => cloudinary.uploader?.destroy ? cloudinary.uploader.destroy(publicId) : { result: "skipped" };
module.exports = { uploadFile, deleteFile, upload: uploadFile };
