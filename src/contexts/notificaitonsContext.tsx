import { createContext, type ReactNode, useCallback, useState } from "react";
import type { NotificationData } from "../partials/notification.tsx";
import Notification from "../partials/notification.tsx";
import { Box } from "ink";

type StoredNotification = NotificationData & { id: string };

export const NotificationsContext = createContext<
  {
    notifications: StoredNotification[];
    push: (n: NotificationData) => void;
    remove: (id: string) => void;
  } | null
>(null);

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

  return (
    <NotificationsContext.Provider value={{ notifications, push, remove }}>
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
