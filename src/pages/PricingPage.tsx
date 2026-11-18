import { Link } from 'react-router-dom'
import { Check, ArrowRight, ArrowLeft } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="DocChat AI" className="w-8 h-8 rounded-lg object-contain shadow-xs" />
            <span className="font-bold text-gray-900 text-lg">DocChat AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Sign in</Link>
            <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-6 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">100% Free Forever</h1>
        <p className="text-gray-500 max-w-xl mx-auto text-base mb-12">
          No subscriptions, no hidden tiers, and no credit card required. All features are free for everyone.
        </p>

        {/* Single Free Plan Card */}
        <div className="max-w-xl mx-auto rounded-3xl border-2 border-blue-600 p-8 md:p-10 bg-white shadow-xl text-left relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold uppercase px-4 py-1 rounded-full tracking-wider shadow-sm">
            Everything Included
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-gray-900">$0</span>
              <span className="text-gray-500 text-base font-medium">/ lifetime free</span>
            </div>
            <p className="text-sm text-gray-600 mt-3">Full access to upload documents, ask questions, and get cited AI answers.</p>

            <ul className="mt-8 space-y-3.5 border-t border-gray-100 pt-6">
              {[
                '50 PDF document storage slots',
                'Up to 25 MB file size per PDF',
                '2,000 AI questions every month',
                'Clickable page citations on every answer',
                'PostgreSQL Row Level Security (RLS) isolation',
                'pgvector semantic search indexing',
                'Full conversation history & threads',
                'Zero ads & no credit card required',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link
            to="/signup"
            className="mt-8 flex items-center justify-center gap-2 w-full text-center py-3.5 px-6 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition shadow-sm"
          >
            Start Using DocChat AI Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* FAQ */}
        <div className="mt-20 text-left max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently asked questions</h2>
          <div className="space-y-4">
            <div className="p-5 border border-gray-200 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-1">Is it really completely free?</h3>
              <p className="text-sm text-gray-500">Yes! The application runs on free tiers of Vercel, Supabase PostgreSQL, and Google Gemini API.</p>
            </div>
            <div className="p-5 border border-gray-200 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-1">Are my documents private?</h3>
              <p className="text-sm text-gray-500">Yes. Documents are stored in private storage buckets with strict PostgreSQL Row Level Security (RLS). Other users cannot query or access your vectors.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
