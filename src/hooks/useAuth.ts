import { createContext, useContext } from 'react'
import type { AuthError, Session } from '@supabase/supabase-js'

export interface AuthValue {
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth phải dùng bên trong <AuthProvider>')
  return value
}
