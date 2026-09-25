import { useState, type ReactNode } from "react"
import LoginPage from "../pages/loginPage"
import RegisterPage from "../pages/registerPage"
export type UnauthScreen = 'login' | 'register'

export default function UnauthenticatedRouter() {
  const [screen, setScreen] = useState<UnauthScreen>('login')

  let myScreen: ReactNode
  switch (screen) {
    case 'login':
      myScreen = <LoginPage setScreen={setScreen} />
      break
    case 'register':
      myScreen = <RegisterPage setScreen={setScreen} />
  }
  return myScreen
}
