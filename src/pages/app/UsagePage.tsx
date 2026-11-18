import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, FileText, HardDrive, Zap } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../hooks/useSubscription'
import { supabase } from '../../lib/supabase'
import { formatBytes } from '../../lib/utils'
import { PLAN_LIMITS } from '../../types'

export default function UsagePage() {
  const { user } = useAuth()
  const { plan } = useSubscription(user?.id)
  const limits = PLAN_LIMITS[plan as 'free' | 'pro'] || PLAN_LIMITS.free
  const [stats, setStats] = useState({ questions: 0, documents: 0, storageBytes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    Promise.all([
      supabase
        .from('usage_events')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('event_type', 'question')
        .gte('occurred_at', startOfMonth.toISOString()),
      supabase.from('documents').select('id, bytes').eq('user_id', user.id),
    ]).then(([questionsRes, docsRes]) => {
      const storageBytes = (docsRes.data || []).reduce((sum, d) => sum + (d.bytes || 0), 0)
      setStats({
        questions: questionsRes.count || 0,
        documents: (docsRes.data || []).length,
        storageBytes,
      })
      setLoading(false)
    })
  }, [user])

  const statCards = [
    {
      label: 'Questions this month',
      value: stats.questions,
      max: limits.questions_per_month,
      icon: MessageSquare,
      unit: '',
    },
    {
      label: 'Documents stored',
      value: stats.documents,
      max: limits.documents,
      icon: FileText,
      unit: '',
    },
    {
      label: 'Total PDF storage used',
      value: formatBytes(stats.storageBytes),
      max: null,
      icon: HardDrive,
      unit: '',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usage & Quotas</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time metrics for your current billing cycle</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
            plan === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {plan === 'pro' ? '⚡ Pro Tier' : 'Free Tier'}
        </span>
      </div>

      <div className="grid gap-6">
        {loading
          ? [1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-xl" />)
          : statCards.map(({ label, value, max, icon: Icon }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-2xl font-extrabold text-gray-900">
                      {value}
                      {max && <span className="text-sm font-normal text-gray-400"> / {max}</span>}
                    </p>
                  </div>
                </div>
                {max && typeof value === 'number' && (
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        value >= max ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
      </div>

      {plan === 'free' && (
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5" />
            <h3 className="font-bold text-lg">Need higher limits?</h3>
          </div>
          <p className="text-blue-100 text-sm mb-5 max-w-lg">
            Upgrade to Pro for 500 questions/month, 50 document slots, and 20 MB max file sizes.
          </p>
          <Link
            to="/app/billing"
            className="bg-white text-blue-600 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition inline-block shadow-xs"
          >
            Upgrade to Pro →
          </Link>
        </div>
      )}
    </div>
  )
}
