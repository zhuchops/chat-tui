import { useAuth } from "../contexts/authContext"
import AuthenticatedRouter from "./authenticatedRouter"
import UnauthenticatedRouter from "./unauthenticatedRouter"

export default function AppRouter() {
  const auth = useAuth()
  return (
    auth.user ? <AuthenticatedRouter /> : <UnauthenticatedRouter />
  )
}
