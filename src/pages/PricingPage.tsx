import { Link } from 'react-router-dom'
import { Check, ArrowRight, ArrowLeft } from 'lucide-react'

export default function PricingPage() {
  const perks = [
    'Store up to 50 PDF files',
    'Files up to 25 MB each',
    '2,000 questions every month',
    'Page citations on every answer',
    'Private database storage',
    'No credit card needed ever',
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between border-b border-gray-100">
        <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <Link to="/signup" className="text-sm font-medium text-blue-600 hover:underline">
          Sign up free
        </Link>
      </nav>

      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">It's 100% free.</h1>
        <p className="mt-3 text-gray-500 text-sm">
          No credit card, no hidden paid tiers, no trial periods. Just upload and chat.
        </p>

        <div className="mt-10 p-8 border border-gray-200 rounded-2xl bg-gray-50/50 text-left">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-extrabold">$0</span>
            <span className="text-sm text-gray-500">forever</span>
          </div>

          <ul className="space-y-3 border-t border-gray-200 pt-6">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/signup"
            className="mt-8 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition"
          >
            Create free account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  )
}
