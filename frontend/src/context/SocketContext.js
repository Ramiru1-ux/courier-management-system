import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const SocketContext = createContext(null);
export function SocketProvider({ children, url = import.meta.env.VITE_SOCKET_URL }) { const socketRef=useRef(null); const [connected,setConnected]=useState(false); useEffect(()=>{if(!url||typeof WebSocket==='undefined')return undefined; const socket=new WebSocket(url);socketRef.current=socket;socket.onopen=()=>setConnected(true);socket.onclose=()=>setConnected(false);return()=>{socket.close();socketRef.current=null;};},[url]); const send=(message)=>{if(socketRef.current?.readyState===WebSocket.OPEN)socketRef.current.send(JSON.stringify(message));}; const value=useMemo(()=>({ socket:socketRef.current, connected, send }),[connected]); return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>; }
export function useSocketContext(){const context=useContext(SocketContext);if(!context)throw new Error('useSocketContext must be used inside SocketProvider');return context;}
export default SocketContext;
