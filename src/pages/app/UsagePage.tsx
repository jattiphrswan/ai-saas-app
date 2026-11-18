import { useEffect, useState } from 'react'
import { MessageSquare, FileText, HardDrive, CheckCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { formatBytes } from '../../lib/utils'
import { PLAN_LIMITS } from '../../types'

export default function UsagePage() {
  const { user } = useAuth()
  const limits = PLAN_LIMITS.free
  const [stats, setStats] = useState({ questions: 0, documents: 0, storageBytes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    if (!isSupabaseConfigured) {
      // Local preview mode stats
      const raw = localStorage.getItem('docchat_local_docs')
      const docs = raw ? JSON.parse(raw) : []
      const storageBytes = docs.reduce((sum: number, d: any) => sum + (d.bytes || 0), 0)
      setStats({
        questions: 3,
        documents: docs.length,
        storageBytes,
      })
      setLoading(false)
      return
    }

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
    },
    {
      label: 'Documents stored',
      value: stats.documents,
      max: limits.documents,
      icon: FileText,
    },
    {
      label: 'Total PDF storage used',
      value: formatBytes(stats.storageBytes),
      max: null,
      icon: HardDrive,
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usage & Status</h1>
          <p className="text-sm text-gray-500 mt-1">Free Lifetime Access with all features enabled</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
          <CheckCircle className="w-3.5 h-3.5" /> 100% Free Plan
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
                      className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6 text-blue-900">
        <h3 className="font-bold text-base mb-1">All Features Unlocked & Free</h3>
        <p className="text-sm text-blue-700">
          You have access to 50 document slots, up to 25 MB per PDF, and 2,000 questions per month with verified citations. No credit card or paid subscription needed.
        </p>
      </div>
    </div>
  )
}
