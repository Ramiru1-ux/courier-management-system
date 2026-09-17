/**
 * Field rules for the two kinds of free text people type into this system:
 *
 *   NAME    - a person, company, branch or contact name. Letters only: no
 *             digits and no symbols, apart from the apostrophe, hyphen and
 *             full stop that real names genuinely use (O'Brien, Anne-Marie,
 *             and the initials Sri Lankan names are usually written with,
 *             e.g. "A.B.C. Perera").
 *   ADDRESS - a postal line, where numbers and address punctuation are
 *             expected. The symbols below never appear in one and are
 *             refused; everything else, including # - , . and /, is allowed.
 *
 * Each getter returns "" when the value is acceptable, or a message saying
 * exactly what is wrong, in the same style as getEmailError in
 * ./emailValidation.js. The filters are for onChange handlers, so a
 * disallowed character cannot be typed into the field in the first place.
 */

/** Symbols an address may never contain. */
export const BLOCKED_ADDRESS_SYMBOLS = '@$%^&*()_+';

// Letters of any script (so Sinhala and Tamil names are accepted), combining
// marks, spaces, and the three marks names are written with.
const NAME_ALLOWED = /[\p{L}\p{M} '.-]/u;
const NAME_SHAPE = /^[\p{L}\p{M}][\p{L}\p{M} '.-]*$/u;

export const getNameError = (value, label = 'Name', { required = true } = {}) => {
  const name = String(value ?? '').trim();
  if (!name) return required ? `${label} is required.` : '';
  if (/\d/.test(name)) return `${label} cannot contain numbers.`;
  if (!NAME_SHAPE.test(name)) {
    return `${label} can only contain letters, spaces, apostrophes, hyphens and full stops - no other symbols.`;
  }
  if (name.length > 120) return `${label} is too long (maximum 120 characters).`;
  return '';
};

export const getAddressError = (value, label = 'Address', { required = true } = {}) => {
  const address = String(value ?? '').trim();
  if (!address) return required ? `${label} is required.` : '';
  const blocked = [...new Set([...address].filter((character) => BLOCKED_ADDRESS_SYMBOLS.includes(character)))];
  if (blocked.length) {
    return `${label} cannot contain ${blocked.join(' ')} - letters, numbers and marks such as # - , . are fine.`;
  }
  if (address.length > 200) return `${label} is too long (maximum 200 characters).`;
  return '';
};

/** Drops anything that is not allowed in a name, as it is typed. */
export const filterNameInput = (value) => String(value ?? '')
  .split('')
  .filter((character) => NAME_ALLOWED.test(character))
  .join('');

/** Drops the blocked symbols from an address, as it is typed. */
export const filterAddressInput = (value) => String(value ?? '')
  .split('')
  .filter((character) => !BLOCKED_ADDRESS_SYMBOLS.includes(character))
  .join('');

export const isValidName = (value) => getNameError(value) === '';
export const isValidAddress = (value) => getAddressError(value) === '';
