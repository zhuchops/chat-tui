import type { ClientMessage, ServerMessage } from "@chat/chat-back/schemas";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type z from "zod";
import { api } from "../api.ts";
import { useAuth } from "./authContext.tsx";
import { NotificationsContext } from "./notificaitonsContext.tsx";

export type ClientMsg = z.infer<typeof ClientMessage>;
export type ServerMsg = z.infer<typeof ServerMessage>;
export type WsStatus = "connecting" | "open" | "closed";

type Listener = (msg: ServerMsg) => void;

const BACKOFF_BASE = 1000;
const BACKOFF_MAX = 30_000;
const CLOSE_UNAUTHORIZED = 4001;

type WebSocketContextValue = {
  status: WsStatus;
  send: (msg: ClientMsg) => boolean;
  subscribe: (fn: (msg: ServerMsg) => void) => () => void;
};

export const WebSocketContext = createContext<WebSocketContextValue | null>(
  null,
);

export function useWebsocket(): WebSocketContextValue {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error("useWebsocket must be used inside <WebsocketProvider>");
  }
  return ctx;
}

export default function WebsocketProvider(
  { children }: { children: ReactNode },
) {
  const { accessToken, logout } = useAuth();
  const notifications = useContext(NotificationsContext);
  const [status, setStatus] = useState<WsStatus>("connecting");

  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef(new Set<Listener>());

  const pushRef = useRef(notifications?.push);
  pushRef.current = notifications?.push;
  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  useEffect(() => {
    if (!accessToken) return;

    let disposed = false;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let notifiedDown = false;

    const connect = () => {
      if (disposed) return;
      setStatus("connecting");

      const socket = api.ws.$ws({ query: { token: accessToken } });
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        attempt = 0;
        if (notifiedDown) {
          pushRef.current?.({ type: "message", content: "Reconnected" });
        }
        notifiedDown = false;
        setStatus("open");
      });

      socket.addEventListener("message", (e) => {
        for (const fn of listenersRef.current) fn(e.data);
      });

      socket.addEventListener("close", (e) => {
        if (socketRef.current === socket) socketRef.current = null;
        if (disposed) return;
        setStatus("closed");

        if (e.code == CLOSE_UNAUTHORIZED) {
          pushRef.current?.({
            type: "warning",
            content: "Session expired. Login again",
          });
          logoutRef.current();
          return;
        }

        if (!notifiedDown) {
          notifiedDown = true;
          pushRef.current?.({
            type: "warning",
            content: "Connection lost. Reconnecting...",
          });
        }

        const delay = Math.min(BACKOFF_BASE * 2 ** attempt, BACKOFF_MAX);
        attempt++;
        timer = setTimeout(connect, delay);
      });
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(timer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [accessToken]);

  const send = useCallback((msg: ClientMsg) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(msg));
    return true;
  }, []);

  const subscribe = useCallback((fn: Listener) => {
    listenersRef.current.add(fn);
    return () => {
      listenersRef.current.delete(fn);
    };
  }, []);

  const value = useMemo<WebSocketContextValue>(
    () => ({ status, send, subscribe }),
    [status, send, subscribe],
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWsMessages(handler: Listener) {
  const { subscribe } = useWebsocket();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => subscribe((msg) => handlerRef.current(msg)), [subscribe]);
}
