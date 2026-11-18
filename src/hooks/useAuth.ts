import { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Local dev mode fallback
      const localEmail = localStorage.getItem('docchat_local_email')
      if (localEmail) {
        const mockUser = {
          id: 'local-dev-user-001',
          email: localEmail,
          app_metadata: {},
          user_metadata: { full_name: localEmail.split('@')[0] },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as unknown as User
        setUser(mockUser)
      } else {
        setUser(null)
      }
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('docchat_local_email')
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }

  return { user, session, loading, signOut, isLocalMode: !isSupabaseConfigured }
}
