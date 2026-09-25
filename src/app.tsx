import { AuthProvider } from "./contexts/authContext";
import { NotificationProvider } from "./contexts/notificaitonsContext";
import AppRouter from "./routers/router";
import { Text } from "ink";

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider fallback={<Text>Loading...</Text>}>
        <AppRouter />
      </AuthProvider>
    </NotificationProvider>
  )
}
