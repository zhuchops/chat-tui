import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { NotificationData } from "../partials/notification.tsx";
import Notification from "../partials/notification.tsx";
import { Box } from "ink";

type StoredNotification = NotificationData & { id: string };

type NotificationsContextValue = {
  notifications: StoredNotification[];
  push: (n: NotificationData) => void;
  remove: (id: string) => void;
};

export const NotificationsContext = createContext<
  NotificationsContextValue | null
>(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error(
      "Notifications can be used only inside notifications context",
    );
  }
  return ctx;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);

  const remove = useCallback((id: string) => {
    setNotifications((prev: StoredNotification[]) =>
      prev.filter((el) => el.id != id)
    );
  }, []);

  const push = useCallback((n: NotificationData, ttl = 4000) => {
    const id = crypto.randomUUID();
    setNotifications((prev: StoredNotification[]) => [...prev, { ...n, id }]);
    setTimeout(() => remove(id), ttl);
  }, [remove]);

  const value = useMemo<NotificationsContextValue>(() => ({
    notifications,
    push,
    remove,
  }), [notifications, push, remove]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <Box
        position="absolute"
        top={1}
        right={2}
        width={40}
        flexDirection="column"
        gap={1}
      >
        {notifications.map((n) => <Notification key={n.id} {...n} />)}
      </Box>
    </NotificationsContext.Provider>
  );
}
