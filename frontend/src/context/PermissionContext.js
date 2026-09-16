import React, { createContext, useContext, useMemo } from 'react';

const PermissionContext = createContext(null);
export function PermissionProvider({ children, permissions = [] }) { const permissionSet=useMemo(()=>new Set(permissions),[permissions]); const can=useMemo(()=>((permission)=>permissionSet.has('*')||permissionSet.has(permission)),[permissionSet]); return <PermissionContext.Provider value={{ permissions:[...permissionSet], can }}>{children}</PermissionContext.Provider>; }
export function usePermissionContext(){const context=useContext(PermissionContext);if(!context)throw new Error('usePermissionContext must be used inside PermissionProvider');return context;}
export default PermissionContext;
