import {
  createContext,
  type ReactNode,
  Suspense,
  use,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SESSION_FILE_PATH } from "../consts.ts";
import { NotificationsContext } from "./notificaitonsContext.tsx";
import z from "zod";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
};

export const InnerStorageUserJsonSchema = z.object({
  id: z.number(),
  email: z.string(),
  username: z.string(),
});

export const InnerStorageJsonSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: InnerStorageUserJsonSchema,
});

type Session = z.infer<typeof InnerStorageJsonSchema>;

type LoadResult =
  | { status: "ok"; session: Session }
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "error" };

async function loadSession(): Promise<LoadResult> {
  try {
    let text: string;
    try {
      text = await Deno.readTextFile(SESSION_FILE_PATH);
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) return { status: "empty" };
      throw e;
    }
    const parsed = InnerStorageJsonSchema.safeParse(JSON.parse(text));
    if (!parsed.success) return { status: "invalid" };
    return { status: "ok", session: parsed.data };
  } catch {
    return { status: "error" };
  }
}

async function saveSession(session: Session) {
  await Deno.writeTextFile(SESSION_FILE_PATH, JSON.stringify(session), { mode: 0o600 });
}

async function clearSession() {
  try {
    await Deno.remove(SESSION_FILE_PATH)
  } catch (e) {
    if (!(e instanceof Deno.errors.NotFound)) throw e
  }
}

type AuthContextValue = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  login: (
    user: AuthUser,
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

const sessionPromise = loadSession();

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

function AuthProviderInner({ children }: { children: ReactNode }) {
  const loaded = use(sessionPromise);

  const notifications = useContext(NotificationsContext);
  const [session, setSession] = useState(
    loaded.status === "ok" ? loaded.session : null,
  );

  const notified = useRef(false);

  useEffect(() => {
    if (notified.current) return;
    notified.current = true;

    switch (loaded.status) {
      case "invalid":
        notifications?.push({
          type: "warning",
          content: "User data saved wrong. Login again",
        });
        return;
      case "error":
        notifications?.push({
          type: "warning",
          content: "Cannnot load user info. Login again",
        });
    }
  }, [loaded, notifications]);

  const login = useCallback(
    async (user: AuthUser, accessToken: string, refreshToken: string) => {
      const next: Session = { user, accessToken, refreshToken };
      setSession(next);
      await saveSession(next);
    },
    [],
  );

  const logout = useCallback(async () => {
    setSession(null);
    await clearSession();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    accessToken: session?.accessToken ?? null,
    refreshToken: session?.refreshToken ?? null,
    user: session?.user ?? null,
    login,
    logout,
  }), [session, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({
  children,
  fallback = null,
}: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <Suspense fallback={fallback}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </Suspense>
  );
}
