import React, { createContext, useContext, useMemo, useState } from 'react';

const OrganizationContext = createContext(null);
export function OrganizationProvider({ children }) { const [organization,setOrganization]=useState({ id:'ORG-001', name:'EGOTECH World Logistics', plan:'Enterprise' }); const value=useMemo(()=>({ organization, setOrganization }),[organization]); return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>; }
export function useOrganizationContext(){const context=useContext(OrganizationContext);if(!context)throw new Error('useOrganizationContext must be used inside OrganizationProvider');return context;}
export default OrganizationContext;
