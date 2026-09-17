const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { FILE_LIMITS } = require("./constants");

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname).toLowerCase();
    const fieldName = file.fieldname.replace(/[^a-zA-Z0-9_-]/g, "_");
    cb(null, `${fieldName}-${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_LIMITS.MAX_DOCUMENT_SIZE,
  },
});

/**
 * Proof-of-delivery attachments are deliberately narrower than the generic
 * upload above: a driver may attach a JPEG or PNG photo, or a PDF, up to
 * 10MB - the same rules the driver portal applies before it uploads
 * (frontend/src/utils/uploadValidation.js). Kept as its own multer instance
 * so the generic document upload's own types and 5MB cap are unchanged.
 *
 * The filter's error carries a `code` so routes/uploadsRoutes.js can tell an
 * unsupported type from multer's own LIMIT_FILE_SIZE and answer with the
 * right message.
 */
const POD_ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const POD_ALLOWED_EXTENSIONS = [".jpeg", ".jpg", ".png", ".pdf"];
const POD_MAX_FILE_SIZE = 10 * 1024 * 1024;

const podFileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const mimetype = String(file.mimetype || "").toLowerCase();
  if (POD_ALLOWED_MIME_TYPES.includes(mimetype) && POD_ALLOWED_EXTENSIONS.includes(extension)) {
    return cb(null, true);
  }
  const error = new Error("This file is not supported. Only .jpeg, .png and .pdf are allowed.");
  error.code = "UNSUPPORTED_FILE_TYPE";
  return cb(error, false);
};

const podUpload = multer({
  storage,
  fileFilter: podFileFilter,
  limits: {
    fileSize: POD_MAX_FILE_SIZE,
  },
});

module.exports = {
  upload,
  podUpload,
  uploadDir,
  POD_ALLOWED_MIME_TYPES,
  POD_ALLOWED_EXTENSIONS,
  POD_MAX_FILE_SIZE,
};