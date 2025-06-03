import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";

function useSocket(serverUrl) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const url = serverUrl || window.location.origin;
    const socketInstance = io(url);
    setSocket(socketInstance);

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, [serverUrl]);

  const emitEvent = useCallback(
    (eventName, data) => {
      if (socket) socket.emit(eventName, data);
    },
    [socket]
  );

  const onEvent = useCallback(
    (eventName, callback) => {
      if (socket) socket.on(eventName, callback);
      return () => {
        if (socket) socket.off(eventName, callback);
      };
    },
    [socket]
  );

  return { socket, emitEvent, onEvent };
}

export default useSocket;
