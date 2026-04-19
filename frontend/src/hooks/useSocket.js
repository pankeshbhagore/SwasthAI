import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

let socketInstance = null;

const useSocket = () => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    if (!socketInstance) {
      socketInstance = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000", {
        auth: { token },
        transports: ["websocket"],
      });
    }
    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      console.log("🔌 Socket connected:", socketInstance.id);
      if (user?._id) {
        socketInstance.emit("join-room", user._id);
      }
    });

    return () => {
      // Don't disconnect on unmount — keep socket alive across pages
    };
  }, [token, user]);

  const emit = (event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event, callback) => {
    socketRef.current?.on(event, callback);
    return () => socketRef.current?.off(event, callback);
  };

  return { socket: socketRef.current, emit, on };
};

export default useSocket;
