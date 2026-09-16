import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Counter Staff is no longer an active role (see authController.js
// CREATABLE_ROLES) - falling through to the '/admin' default below for a
// role with no entry here is safe either way, since RoleBasedRoute
// independently re-checks the actual role against each route's own
// allowedRoles and bounces to /unauthorized on a mismatch regardless of
// what this component tried to navigate to first.
const ROLE_HOME = {
  admin: '/admin',
  finance: '/finance',
  dispatcher: '/dispatcher',
  driver: '/driver',
  branch: '/branch',
  merchant: '/merchant',
  customer: '/customer',
};

export default function RoleHome() {
  const { user } = useAuth();
  const target = ROLE_HOME[user?.role] || '/admin';
  return <Navigate to={target} replace />;
}
