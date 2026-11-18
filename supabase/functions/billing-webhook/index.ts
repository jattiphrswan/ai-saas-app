// supabase/functions/billing-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const STRIPE_WEBHOOK_SECRET = Deno.env.get('PAYMENT_WEBHOOK_SECRET') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) return new Response('Missing signature', { status: 400 })

    const body = await req.text()

    if (STRIPE_WEBHOOK_SECRET) {
      const isValid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET)
      if (!isValid) return new Response('Invalid signature', { status: 401 })
    }

    const event = JSON.parse(body)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Idempotency check
    const { data: existing } = await supabase
      .from('billing_events')
      .select('id')
      .eq('provider_event_id', event.id)
      .maybeSingle()

    if (existing) return new Response('OK', { status: 200 })

    await supabase.from('billing_events').insert({
      provider_event_id: event.id,
      event_type: event.type,
      payload_digest: await sha256(body),
    })

    const obj = event.data?.object
    const userId = obj?.metadata?.supabase_user_id || obj?.customer_details?.metadata?.supabase_user_id

    switch (event.type) {
      case 'checkout.session.completed': {
        if (obj.mode === 'subscription' && obj.subscription && obj.payment_status === 'paid') {
          if (userId) {
            await supabase.from('subscriptions').upsert({
              user_id: userId,
              provider: 'stripe',
              provider_customer_id: obj.customer,
              provider_subscription_id: obj.subscription,
              plan_code: obj.metadata?.plan_code || 'pro',
              status: 'active',
            })
          }
        }
        break
      }
      case 'customer.subscription.deleted': {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('provider_subscription_id', obj.id)
          .maybeSingle()

        if (sub?.user_id) {
          await supabase.from('subscriptions').update({
            plan_code: 'free',
            status: 'canceled',
          }).eq('user_id', sub.user_id)
        }
        break
      }
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return new Response('Internal error', { status: 500 })
  }
})

async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  try {
    const parts = header.split(',').reduce<Record<string, string>>((acc, part) => {
      const [k, v] = part.split('=')
      if (k && v) acc[k] = v
      return acc
    }, {})
    const timestamp = parts['t']
    const signature = parts['v1']
    if (!timestamp || !signature) return false

    const signedPayload = `${timestamp}.${payload}`
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
    const computed = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    return computed === signature
  } catch {
    return false
  }
}

async function sha256(text: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
