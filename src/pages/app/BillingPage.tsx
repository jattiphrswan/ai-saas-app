import { Check, ShieldCheck } from 'lucide-react'

export default function BillingPage() {
  const freeFeatures = [
    '50 PDFs storage capacity',
    'Up to 25 MB per PDF upload',
    '2,000 AI questions every month',
    'Fast semantic vector search (pgvector)',
    'Detailed clickable page citations',
    'Full conversation history & threading',
    'PostgreSQL Row Level Security (RLS)',
    '100% Free Forever — no credit card needed',
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Plan & Features</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Free Full Access Plan</h2>
            <p className="text-xs text-gray-400 mt-0.5">Active &bull; Unlimited Lifetime Access</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          All capabilities of DocChat AI are unlocked for your account. You have full access to PDF ingestion, vector search, and grounded AI question answering.
        </p>

        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Included Features</h3>
          <ul className="grid sm:grid-cols-2 gap-3">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
