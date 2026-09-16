import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const NotificationContext = createContext(null);
export function NotificationProvider({ children }) { const [notifications,setNotifications]=useState([]); const addNotification=useCallback((notification)=>setNotifications((current)=>[{ id:Date.now(), read:false, ...notification },...current]),[]); const markRead=useCallback((id)=>setNotifications((current)=>current.map((item)=>item.id===id?{...item,read:true}:item)),[]); const markAllRead=useCallback(()=>setNotifications((current)=>current.map((item)=>({...item,read:true}))),[]); const value=useMemo(()=>({ notifications, unreadCount:notifications.filter((item)=>!item.read).length, addNotification, markRead, markAllRead }),[notifications,addNotification,markRead,markAllRead]); return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>; }
export function useNotificationContext(){const context=useContext(NotificationContext);if(!context)throw new Error('useNotificationContext must be used inside NotificationProvider');return context;}
export default NotificationContext;
