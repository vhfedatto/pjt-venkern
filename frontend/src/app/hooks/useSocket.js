import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";
function useSocket() {
  const { token, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket();
      setConnected(false);
      setSocket(null);
      return;
    }
    const s = connectSocket(token);
    setSocket(s);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    if (s.connected) setConnected(true);
    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
    };
  }, [token, isAuthenticated]);
  return { socket, connected };
}
export {
  useSocket
};
