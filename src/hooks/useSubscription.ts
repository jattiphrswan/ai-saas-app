import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Subscription } from '../types'

export function useSubscription(userId?: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle()
      .then(({ data }) => { setSubscription(data); setLoading(false) })
  }, [userId])

  return { subscription, plan: subscription?.plan_code ?? 'free', loading }
}
