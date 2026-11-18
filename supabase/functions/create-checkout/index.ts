// supabase/functions/create-checkout/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STRIPE_SECRET_KEY = Deno.env.get('PAYMENT_PROVIDER_SECRET') || ''
const PRO_PRICE_ID = Deno.env.get('PAYMENT_PRO_PRICE_ID') || ''
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

    const { planCode } = await req.json()
    if (planCode !== 'pro') return json({ data: null, error: 'Invalid plan' }, 400)

    if (!STRIPE_SECRET_KEY || !PRO_PRICE_ID) {
      return json({
        data: null,
        error: 'Payment provider not configured yet. Please set PAYMENT_PROVIDER_SECRET and PAYMENT_PRO_PRICE_ID.',
      }, 503)
    }

    // Lookup customer or create new Stripe customer
    let customerId: string | undefined
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('provider_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    customerId = sub?.provider_customer_id

    if (!customerId) {
      const customerRes = await stripeRequest('/customers', 'POST', {
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customerRes.id
    }

    const origin = req.headers.get('origin') || 'https://your-app.vercel.app'
    const session = await stripeRequest('/checkout/sessions', 'POST', {
      customer: customerId,
      mode: 'subscription',
      'payment_method_types[0]': 'card',
      'line_items[0][price]': PRO_PRICE_ID,
      'line_items[0][quantity]': 1,
      success_url: `${origin}/app/billing?success=true`,
      cancel_url: `${origin}/app/billing?canceled=true`,
      'metadata[supabase_user_id]': user.id,
      'metadata[plan_code]': planCode,
    })

    return json({ data: { checkoutUrl: session.url }, error: null })
  } catch (err: any) {
    console.error('create-checkout error:', err)
    return json({ data: null, error: err.message || 'Internal error' }, 500)
  }
})

async function stripeRequest(path: string, method: string, body?: Record<string, unknown>) {
  const params = new URLSearchParams()
  if (body) {
    for (const [k, v] of Object.entries(body)) {
      params.append(k, String(v))
    }
  }
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: method !== 'GET' ? params.toString() : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Stripe error')
  return data
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
