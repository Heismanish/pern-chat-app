import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuthContext } from "./AuthContext";

interface SocketContextProviderType {
  socket: Socket | null;
  onlineUsers: string[];
  typingUser: string | null;
}

const SocketURL =
  import.meta.env.MODE === "development" ? "http://localhost:3001" : "/";

const SocketContext = createContext<SocketContextProviderType | undefined>(
  undefined
);

export const useSocketContext = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("SocketContextProvider not found");
  }

  return context;
};

const SocketContextProvider = ({ children }: { children: ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const { authUser, isLoading } = useAuthContext();

  useEffect(() => {
    if (authUser && !isLoading) {
      const socket = io(SocketURL, {
        query: {
          userId: authUser.id,
        },
      });

      socketRef.current = socket;
      socket.on("getOnlineUsers", (users: string[]) => {
        setOnlineUsers(users);
      });

      // Listen for "userTyping" event
      socket.on("userTyping", (userId: string) => {
        if (userId !== authUser.id) {
          setTypingUser(userId);
          setTimeout(() => setTypingUser(null), 3000);
        }
      });

      return () => {
        socket.close();
        socketRef.current = null;
      };
    } else if (!isLoading && !authUser) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    }
  }, [authUser, isLoading]);

  return (
    <SocketContext.Provider
      value={{ onlineUsers, socket: socketRef.current, typingUser }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;
