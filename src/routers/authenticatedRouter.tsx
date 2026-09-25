import { useState, type ReactNode } from "react";
import ProfilePage from "../pages/profilePage";

export type AuthenticatedScreen = 'profile'

export default function AuthenticatedRouter() {
  const [screen, setScreen] = useState<AuthenticatedScreen>('profile')
  let Screen: ReactNode
  switch (screen) {
    case 'profile':
      Screen = <ProfilePage setScreen={setScreen} />
  }
  return Screen
}
