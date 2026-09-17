/**
 * What a driver may attach as proof of delivery: a JPEG or PNG photo, or a
 * PDF, up to 10MB. The same rules are enforced server-side on
 * POST /api/uploads/pod-photo (backend/config/multerConfig.js and
 * backend/routes/uploadsRoutes.js), so a file that slips past the browser -
 * or a request that never went through it - is refused there too, with the
 * same wording.
 */

export const POD_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const POD_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
// image/jpg is not a real media type, but some Windows and Android browsers
// still report it for a .jpg file.
const TOLERATED_MIME_TYPES = [...POD_ALLOWED_MIME_TYPES, 'image/jpg'];
export const POD_ALLOWED_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.pdf'];

/** Value for an <input type="file"> accept attribute. */
export const POD_ACCEPT = '.jpeg,.jpg,.png,.pdf,image/jpeg,image/png,application/pdf';

export const UNSUPPORTED_FILE_MESSAGE = 'This file is not supported. Only .jpeg, .png and .pdf are allowed.';
export const FILE_TOO_LARGE_MESSAGE = 'This file is too large. The maximum size is 10MB.';

const formatSize = (bytes) => {
  const mb = bytes / (1024 * 1024);
  return mb >= 10 ? `${Math.round(mb)}MB` : `${mb.toFixed(1)}MB`;
};

/**
 * Returns "" when the file may be uploaded, otherwise the message to show.
 * The type is judged on the file extension as well as the browser-reported
 * media type, because a browser reports an empty type for some files and a
 * renamed one can claim a type its contents are not.
 */
export const getPodFileError = (file) => {
  if (!file) return '';

  const name = String(file.name || '').toLowerCase();
  const type = String(file.type || '').toLowerCase();
  const extensionAllowed = POD_ALLOWED_EXTENSIONS.some((extension) => name.endsWith(extension));
  const typeAllowed = type ? TOLERATED_MIME_TYPES.includes(type) : true;
  if (!extensionAllowed || !typeAllowed) return UNSUPPORTED_FILE_MESSAGE;

  if (Number(file.size) > POD_MAX_FILE_BYTES) {
    return `${FILE_TOO_LARGE_MESSAGE} This one is ${formatSize(Number(file.size))}.`;
  }
  return '';
};

export const isPdfFile = (file) => String(file?.type || '').toLowerCase() === 'application/pdf'
  || String(file?.name || '').toLowerCase().endsWith('.pdf');
