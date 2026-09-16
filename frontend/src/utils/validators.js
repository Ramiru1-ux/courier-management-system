export const isRequired = (value) => String(value ?? '').trim().length > 0;
export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
export const isPhone = (value) => /^[+\d][\d\s-]{7,}$/.test(String(value || ''));
export const minLength = (value, length) => String(value || '').length >= length;
export const validateRequired = (values, fields) => fields.reduce((errors, field) => (isRequired(values[field]) ? errors : { ...errors, [field]: 'This field is required.' }), {});
