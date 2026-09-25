import { createContext, Suspense, use, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SESSION_FILE_PATH } from "../consts";
import { NotificationsContext } from "./notificaitonsContext";
import { write } from "bun";
import Type, { type Static } from "typebox";
import Value from "typebox/value";

export type AuthUser = {
  id: number,
  username: string,
  email: string,
}

export const InnerStorageUserJsonSchema = Type.Object({
  id: Type.Integer(),
  email: Type.String(),
  username: Type.String(),
})

export const InnerStorageJsonSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
  user: InnerStorageUserJsonSchema
})

type Session = Static<typeof InnerStorageJsonSchema>

type LoadResult =
  | { status: 'ok', session: Session }
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'error' }

async function loadSession(): Promise<LoadResult> {
  try {
    const file = Bun.file(SESSION_FILE_PATH)
    if (!await file.exists()) { return { status: 'empty' } }
    const fileJson = await file.json()
    if (!Value.Check(InnerStorageJsonSchema, fileJson)) {
      return { status: 'invalid' }
    }
    return { status: 'ok', session: fileJson }
  } catch {
    return { status: 'error' }
  }
}

async function saveSession(session: Session) {
  await write(SESSION_FILE_PATH, JSON.stringify(session), { mode: 0o600 })
}

async function clearSession() {
  const file = Bun.file(SESSION_FILE_PATH)
  if (await file.exists()) {
    await file.delete()
  }
}

type AuthContextValue = {
  accessToken: string | null,
  refreshToken: string | null,
  user: AuthUser | null,
  login: (user: AuthUser, accessToken: string, refreshToken: string) => Promise<void>,
  logout: () => Promise<void>,
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const sessionPromise = loadSession()

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

function AuthProviderInner({ children }: { children: ReactNode }) {
  const loaded = use(sessionPromise)

  const notifications = useContext(NotificationsContext)
  const [session, setSession] = useState(
    loaded.status === 'ok' ? loaded.session : null
  )

  const notified = useRef(false)

  useEffect(() => {
    if (notified.current) return
    notified.current = true

    switch (loaded.status) {
      case 'invalid':
        notifications?.push({ type: 'warning', content: 'User data saved wrong. Login again' })
        return
      case 'error':
        notifications?.push({ type: 'warning', content: 'Cannnot load user info. Login again' })
    }
  }, [loaded, notifications])

  const login = useCallback(async (user: AuthUser, accessToken: string, refreshToken: string) => {
    const next: Session = { user, accessToken, refreshToken }
    setSession(next)
    await saveSession(next)
  }, [])

  const logout = useCallback(async () => {
    setSession(null)
    await clearSession()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    accessToken: session?.accessToken ?? null,
    refreshToken: session?.refreshToken ?? null,
    user: session?.user ?? null,
    login,
    logout
  }), [session, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({
  children, fallback = null,
}: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <Suspense fallback={fallback}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </Suspense>
  )
}
