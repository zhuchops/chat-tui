import { AuthProvider } from "./contexts/authContext.tsx";
import { NotificationProvider } from "./contexts/notificaitonsContext.tsx";
import AppRouter from "./routers/router.tsx";
import { Box, Text } from "ink";

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider fallback={<Text>Loading...</Text>}>
        <AppRouter />
      </AuthProvider>
    </NotificationProvider>
  );
}
