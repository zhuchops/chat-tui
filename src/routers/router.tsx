import { useAuth } from "../contexts/authContext.tsx";
import AuthenticatedRouter from "./authenticatedRouter.tsx";
import UnauthenticatedRouter from "./unauthenticatedRouter.tsx";

export default function AppRouter() {
  const auth = useAuth();
  return (
    auth.user ? <AuthenticatedRouter /> : <UnauthenticatedRouter />
  );
}
