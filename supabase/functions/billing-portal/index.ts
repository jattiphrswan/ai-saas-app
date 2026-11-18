// supabase/functions/billing-portal/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STRIPE_SECRET_KEY = Deno.env.get('PAYMENT_PROVIDER_SECRET') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) return json({ data: null, error: 'Unauthorized' }, 401)

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return json({ data: null, error: 'Unauthorized' }, 401)

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('provider_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!sub?.provider_customer_id) {
      return json({ data: null, error: 'No active Stripe customer found' }, 404)
    }

    const origin = req.headers.get('origin') || 'https://your-app.vercel.app'
    const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: sub.provider_customer_id,
        return_url: `${origin}/app/billing`,
      }).toString(),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'Stripe portal error')

    return json({ data: { url: data.url }, error: null })
  } catch (err: any) {
    return json({ data: null, error: err.message || 'Internal error' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
