'use client';
import React , { useMemo } from "react";
import { io } from "socket.io-client";

const SocketContect = React.createContext<any>(null);

export const useSocket = () => {
    return React.useContext(SocketContect);
}

export const SocketProvider = (props : any) => {
    const socket = useMemo(() => {
        return io('https://chat-socket-server-kb9v.onrender.com');
    }, []);

    return (
        <SocketContect.Provider value={{socket}}>
            {props.children}
        </SocketContect.Provider>
    );
}