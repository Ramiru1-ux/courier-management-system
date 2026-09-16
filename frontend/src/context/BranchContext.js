import React, { createContext, useContext, useMemo, useState } from 'react';

const BranchContext = createContext(null);
export function BranchProvider({ children }) { const [branch,setBranch]=useState({ id:'CMB-01', name:'Colombo Central', city:'Colombo' }); const value=useMemo(()=>({ branch, setBranch }),[branch]); return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>; }
export function useBranchContext() { const context=useContext(BranchContext); if(!context) throw new Error('useBranchContext must be used inside BranchProvider'); return context; }
export default BranchContext;
