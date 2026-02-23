import { createContext, useContext, useEffect, useState } from 'react'
import { me as fetchMe } from '../api/auth'
import { getToken, clearToken } from '../auth'

type User = {
  id:number ; name: string ; email: string;
  roles: string[] ; createdAt: string; updatedAt: string;
}

type AuthState = {
    user: User | null
    loading: boolean
    setUser: (u: User | null) => void
    logout: () => void;
}

const AuthCtx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  const token = getToken()
  if (!token) { setLoading(false); return }
  
  fetchMe()
    .then((u) => setUser(u as any))
    .catch((e) => {
      const status = e?.response?.status ?? 0
      console.log('[BOOT /me failed]', status, e?.response?.data)
      if (status === 401) {
        clearToken()
        setUser(null)
      }
    })
    .finally(() => setLoading(false))
  }, [])

  function logout() {
    clearToken()
    setUser(null)
  }

  return (
  <AuthCtx.Provider value={{ user, loading, setUser, logout }}>{children}</AuthCtx.Provider>)
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}