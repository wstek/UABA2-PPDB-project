// import socketio from "socket.io-client";
import React from "react";

export const SocketContext = React.createContext({
    socket: null,
    tasks: [],
    setTasks: () => {},
    addTask: () => {},
    removeTask: () => {}
});
