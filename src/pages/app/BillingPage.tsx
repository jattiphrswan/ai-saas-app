import { useState } from 'react'
import { Check, Zap, ExternalLink } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../hooks/useSubscription'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function BillingPage() {
  const { user } = useAuth()
  const { plan, subscription } = useSubscription(user?.id)
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const res = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planCode: 'pro' }),
      })
      const json = await res.json()
      if (json.data?.checkoutUrl) {
        window.location.href = json.data.checkoutUrl
      } else {
        toast.error(json.error || 'Could not initiate checkout session')
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const handlePortal = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const res = await fetch(`${supabaseUrl}/functions/v1/billing-portal`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      })
      const json = await res.json()
      if (json.data?.url) {
        window.location.href = json.data.url
      } else {
        toast.error('Could not open billing portal')
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const proFeatures = [
    '50 PDFs storage capacity',
    'Up to 20 MB per PDF upload',
    '500 questions every month',
    'High priority processing speed',
    'Detailed page citations',
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Subscription & Billing</h1>

      {/* Current plan card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Current Plan</p>
            <p className="text-2xl font-extrabold text-gray-900 capitalize mt-1">{plan} Plan</p>
            {subscription?.current_period_end && (
              <p className="text-xs text-gray-500 mt-1">
                {subscription.cancel_at_period_end ? 'Expires' : 'Renews'} on{' '}
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              plan === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {plan === 'pro' ? '⚡ Pro' : 'Free'}
          </span>
        </div>
      </div>

      {plan === 'free' ? (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold">Upgrade to Pro</h2>
          </div>
          <p className="text-blue-100 text-sm mb-6 max-w-lg">
            Unlock advanced capabilities for deep research and heavy document processing.
          </p>
          <ul className="space-y-3 mb-8">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-blue-50">
                <Check className="w-4 h-4 text-white flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-3xl font-extrabold">$15</span>
              <span className="text-blue-200 text-sm"> / month</span>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-60 font-semibold px-6 py-2.5 rounded-xl transition text-sm flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {loading && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Opening checkout…' : 'Upgrade now'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <h3 className="font-semibold text-gray-900 mb-2">Manage your subscription</h3>
          <p className="text-sm text-gray-500 mb-5">
            Update your payment method, view past invoices, or cancel renewal.
          </p>
          <button
            onClick={handlePortal}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-60 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer"
          >
            {loading ? 'Opening…' : 'Open Stripe Portal'} <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
