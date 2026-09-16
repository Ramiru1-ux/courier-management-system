// Session storage helpers shared by AuthContext and the axios client.
//
// IMPORTANT: admin/finance/dispatcher/merchant all live in the same "main"
// portal build, so several roles are often open in different tabs at once.
// Session data is namespaced PER ROLE (cms_admin_token, cms_finance_token,
// ...) instead of one shared cms_token - otherwise signing into Finance in
// one tab would silently overwrite the Admin session in another tab.
//
// ACTIVE_ROLE_KEY lives in sessionStorage (tab-scoped) so each tab remembers
// which role IT is signed in as, independent of other tabs.

export const ACTIVE_ROLE_KEY = 'cms_active_role';
export const KNOWN_ROLES = ['admin', 'finance', 'dispatcher', 'driver', 'merchant', 'customer', 'branch', 'counter'];

export function keysFor(role) {
  const prefix = `cms_${role}_`;
  return {
    token: `${prefix}token`,
    roleKey: `${prefix}role`,
    user: `${prefix}user`,
    expiresAt: `${prefix}expires_at`,
  };
}

export function getActiveRole(portalRole = null) {
  if (typeof window === 'undefined') return null;
  return portalRole || sessionStorage.getItem(ACTIVE_ROLE_KEY) || null;
}

export function setActiveRole(role) {
  if (typeof window === 'undefined') return;
  if (role) sessionStorage.setItem(ACTIVE_ROLE_KEY, role);
  else sessionStorage.removeItem(ACTIVE_ROLE_KEY);
}

export function storageForRole(role) {
  if (typeof window === 'undefined' || !role) return null;
  const { token } = keysFor(role);
  if (localStorage.getItem(token)) return localStorage;
  if (sessionStorage.getItem(token)) return sessionStorage;
  return null;
}

export function clearRoleStorage(role) {
  if (typeof window === 'undefined' || !role) return;
  const keys = keysFor(role);
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem(keys.token);
    storage.removeItem(keys.roleKey);
    storage.removeItem(keys.user);
    storage.removeItem(keys.expiresAt);
  });
}

/**
 * The JWT for whichever role this tab is signed in as. Falls back to
 * scanning the known roles so an API call made before the active role is
 * set still carries a token.
 */
export function getStoredToken(portalRole = null) {
  if (typeof window === 'undefined') return null;

  const activeRole = getActiveRole(portalRole);
  if (activeRole) {
    const { token } = keysFor(activeRole);
    const value = localStorage.getItem(token) || sessionStorage.getItem(token);
    if (value) return value;
  }

  for (const role of KNOWN_ROLES) {
    const { token } = keysFor(role);
    const value = localStorage.getItem(token) || sessionStorage.getItem(token);
    if (value) return value;
  }

  return null;
}
