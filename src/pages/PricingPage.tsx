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
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Simple, transparent pricing</h1>
        <p className="text-gray-500 max-w-xl mx-auto text-base">Start with the Free plan to test with your own documents. Upgrade to Pro when you need more documents and questions.</p>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto mt-12 text-left">
          {/* Free Card */}
          <div className="rounded-2xl border border-gray-200 p-8 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Free Tier</span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-gray-400 text-sm">/ month</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Perfect for evaluating and personal small documents.</p>
              <ul className="mt-6 space-y-3">
                {[
                  '3 PDFs stored simultaneously',
                  'Up to 5 MB per PDF file',
                  '20 questions per month',
                  'Full page citations included',
                  'PostgreSQL RLS security',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/signup" className="mt-8 block w-full text-center py-2.5 px-4 rounded-xl border border-gray-300 font-semibold text-sm text-gray-700 hover:bg-gray-50 transition">
              Get Started Free
            </Link>
          </div>

          {/* Pro Card */}
          <div className="rounded-2xl border-2 border-blue-600 p-8 bg-blue-600 text-white shadow-lg flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 bg-blue-900 text-white text-xs font-bold uppercase px-3 py-1 rounded-full tracking-wider">
              Popular
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Pro Plan</span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">$15</span>
                <span className="text-blue-200 text-sm">/ month</span>
              </div>
              <p className="text-sm text-blue-100 mt-2">For researchers, analysts, and power document readers.</p>
              <ul className="mt-6 space-y-3">
                {[
                  '50 PDFs stored',
                  'Up to 20 MB per PDF file',
                  '500 questions per month',
                  'Priority AI response generation',
                  'Detailed citation page linking',
                  'Priority support',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-blue-50">
                    <Check className="w-4 h-4 text-white flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/signup" className="mt-8 block w-full text-center py-2.5 px-4 rounded-xl bg-white font-semibold text-sm text-blue-600 hover:bg-blue-50 transition shadow-sm">
              Upgrade to Pro <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 text-left max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently asked questions</h2>
          <div className="space-y-4">
            <div className="p-5 border border-gray-200 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-1">What formats are supported?</h3>
              <p className="text-sm text-gray-500">Currently text-based PDF files are fully supported. OCR for scanned images in PDFs is planned for Phase 2.</p>
            </div>
            <div className="p-5 border border-gray-200 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-1">Are my documents private?</h3>
              <p className="text-sm text-gray-500">Yes. Documents are stored in private Supabase buckets with strict PostgreSQL Row Level Security (RLS). Other users cannot query or access your vectors.</p>
            </div>
            <div className="p-5 border border-gray-200 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-1">Can I cancel anytime?</h3>
              <p className="text-sm text-gray-500">Yes, you can cancel your subscription at any time through the customer billing portal. You will retain access until the end of your billing cycle.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
