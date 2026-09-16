import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function RoleBasedRoute({ allowedRoles = [], children, fallbackPath = '/unauthorized' }) { const { isAuthenticated, user } = useAuth(); if(!isAuthenticated)return <Navigate to="/login" replace />; if(allowedRoles.length && !allowedRoles.includes(user?.role))return <Navigate to={fallbackPath} replace />; return children || <Outlet />; }
