import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SESSION_IDLE_TIMEOUT_MS, SESSION_MAX_AGE_MS } from '../utils/authSecurity';
import { PORTAL_ROLE } from '../config/portal';
import authApi from '../api/authApi';
import {
  keysFor,
  getActiveRole as readActiveRole,
  setActiveRole as writeActiveRole,
  storageForRole,
  clearRoleStorage,
} from '../utils/session';

const AuthContext = createContext(null);

function getActiveRole() {
  return readActiveRole(PORTAL_ROLE);
}

function setActiveRole(role) {
  writeActiveRole(role);
}

function readSession() {
  if (typeof window === 'undefined') return { token: null, user: null, expiresAt: null, remembered: false };

  const activeRole = getActiveRole();
  if (!activeRole) return { token: null, user: null, expiresAt: null, remembered: false };

  const storage = storageForRole(activeRole);
  if (!storage) return { token: null, user: null, expiresAt: null, remembered: false };

  const keys = keysFor(activeRole);
  const token = storage.getItem(keys.token);
  const userValue = storage.getItem(keys.user);
  const expiresAt = Number(storage.getItem(keys.expiresAt)) || null;

  // A token past its expiry is treated as if it were never there. The
  // backend also rejects an expired JWT on the next API call.
  if (token && expiresAt && Date.now() > expiresAt) {
    clearRoleStorage(activeRole);
    setActiveRole(null);
    return { token: null, user: null, expiresAt: null, remembered: false };
  }

  let user = null;
  if (userValue) {
    try {
      user = JSON.parse(userValue);
    } catch (error) {
      clearRoleStorage(activeRole);
      setActiveRole(null);
    }
  }

  return {
    token: user ? token : null,
    user,
    expiresAt: user ? expiresAt : null,
    remembered: Boolean(user && storage === localStorage),
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    // Only resync from a storage event if it affects THIS tab's active role.
    const sync = (event) => {
      const activeRole = getActiveRole();
      if (!activeRole) return;
      if (event.key && !event.key.startsWith(`cms_${activeRole}_`)) return;
      setSession(readSession());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

    const logout = useCallback((reason) => {
    const activeRole = getActiveRole();
    // Read this session's token BEFORE clearing storage, so the backend can
    // record the logout time in login_details.
    const storage = activeRole ? storageForRole(activeRole) : null;
    const token = storage ? storage.getItem(keysFor(activeRole).token) : null;

    if (activeRole) clearRoleStorage(activeRole);
    setActiveRole(null);
    setSession({ token: null, user: null, expiresAt: null, remembered: false });
    // Fire-and-forget; a JWT is stateless so the client dropping it is enough.
    authApi.logout(token, typeof reason === 'string' ? reason : 'manual').catch(() => {});
    return reason || null;
  }, []);

  /**
   * Stores the session returned by POST /api/auth/login. The token is a real
   * JWT signed by the backend - it is sent on every later API call and the
   * server verifies it against the MongoDB users collection.
   */
  const login = useCallback((authResult, { remember = true } = {}) => {
    const token = authResult?.token;
    const serverUser = authResult?.user || authResult?.data;
    if (!token || !serverUser) throw new Error('Login response was missing the token or user');

    const role = String(serverUser.role || 'customer').toLowerCase();
    const expiresAt = Date.now() + SESSION_MAX_AGE_MS;
    const keys = keysFor(role);
    const storage = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;

    // Make sure only one storage holds this role's session at a time.
    other.removeItem(keys.token);
    other.removeItem(keys.roleKey);
    other.removeItem(keys.user);
    other.removeItem(keys.expiresAt);

    const user = {
      id: serverUser.id,
      name: serverUser.name,
      email: serverUser.email,
      phone: serverUser.phone || '',
      role,
      branch: serverUser.branch || '',
      driverId: serverUser.driverId || '',
      merchantName: serverUser.merchantName || '',
    };

    storage.setItem(keys.token, token);
    storage.setItem(keys.roleKey, role);
    storage.setItem(keys.expiresAt, String(expiresAt));
    storage.setItem(keys.user, JSON.stringify(user));

    setActiveRole(role);
    lastActivityRef.current = Date.now();
    setSession({ token, user, expiresAt, remembered: remember });
    return user;
  }, []);

  // On load, confirm the stored token is still valid with the backend. If the
  // server rejects it (expired, user deleted, password changed) the session
  // is cleared so the user is sent back to the sign-in page.
  useEffect(() => {
    if (!session.token) return;
    let cancelled = false;
    authApi.getCurrentUser()
      .then((response) => {
        if (cancelled || !response?.data) return;
        const activeRole = getActiveRole();
        if (!activeRole) return;
        const storage = storageForRole(activeRole);
        if (!storage) return;
        const fresh = { ...session.user, ...response.data, role: String(response.data.role).toLowerCase() };
        storage.setItem(keysFor(activeRole).user, JSON.stringify(fresh));
        setSession((current) => ({ ...current, user: fresh }));
      })
      .catch((error) => {
        if (cancelled) return;
        // Only sign out on a real auth rejection, not on a network hiccup.
        if (error?.status === 401 || error?.status === 403) logout('token-invalid');
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token]);

  // Temporary sessions expire after inactivity. Remembered sessions are kept
  // until their explicit max age so users are not logged out while reading.
  useEffect(() => {
    if (!session.token || typeof window === 'undefined') return undefined;

    const markActive = () => { lastActivityRef.current = Date.now(); };
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, markActive, { passive: true }));

    const interval = window.setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current;
      if (!session.remembered && idleFor > SESSION_IDLE_TIMEOUT_MS) {
        logout('idle');
      } else if (session.expiresAt && Date.now() > session.expiresAt) {
        logout('expired');
      }
    }, 15000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, markActive));
      window.clearInterval(interval);
    };
  }, [session.token, session.expiresAt, session.remembered, logout]);

  // Real, persisted profile edit - PATCH /api/auth/me only ever accepts
  // name/phone (see authController.js updateProfile()), so there is no risk
  // of this being used to smuggle a role/permission/ownership change even
  // though it reuses the same local session-storage write as login().
  const updateProfile = useCallback(async (updates) => {
    const response = await authApi.updateProfile(updates);
    const activeRole = getActiveRole();
    if (!activeRole) return response.data;
    const storage = storageForRole(activeRole);
    const fresh = { ...session.user, name: response.data.name, phone: response.data.phone };
    if (storage) storage.setItem(keysFor(activeRole).user, JSON.stringify(fresh));
    setSession((current) => ({ ...current, user: fresh }));
    return fresh;
  }, [session.user]);

  const value = useMemo(() => ({
    token: session.token,
    user: session.user,
    expiresAt: session.expiresAt,
    isAuthenticated: Boolean(session.token && session.user),
    login,
    logout,
    updateProfile,
  }), [session, login, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
