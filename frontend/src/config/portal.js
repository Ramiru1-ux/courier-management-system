const PORTAL_ROLES = ['driver', 'customer'];

export const PORTAL_ROLE = PORTAL_ROLES.includes(import.meta.env.MODE) ? import.meta.env.MODE : null;
export const PORTAL_LABEL = PORTAL_ROLE === 'driver' ? 'Driver portal' : PORTAL_ROLE === 'customer' ? 'Customer portal' : 'Courier CMS';
