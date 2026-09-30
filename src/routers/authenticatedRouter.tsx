import { type ReactNode, useState } from "react";
import ProfilePage from "../pages/profilePage.tsx";
import WebsocketProvider from "../contexts/websocketContext.tsx";
import ChatsPage from "../pages/chatsPage.tsx";
import DashboardPage from "../pages/dashboardPage.tsx";

export type AuthScreen = "profile" | "dashboard" | "chats" | "settings";

export default function AuthenticatedRouter() {
  const [screen, setScreen] = useState<AuthScreen>("dashboard");
  let Screen: ReactNode = <DashboardPage setScreen={setScreen} />;
  switch (screen) {
    case "dashboard":
      Screen = <DashboardPage setScreen={setScreen} />;
      break;
    case "profile":
      Screen = <ProfilePage setScreen={setScreen} />;
      break;
    case "chats":
      Screen = <ChatsPage setScreen={setScreen} />;
  }
  return (
    <WebsocketProvider>
      {Screen}
    </WebsocketProvider>
  );
}
