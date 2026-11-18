import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/app/settings`,
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-sm p-6 sm:p-8">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <img src="/favicon.png" alt="DocChat" className="w-8 h-8 rounded" />
          <span className="font-bold text-gray-900 text-lg">DocChat AI</span>
        </Link>

        {sent ? (
          <div className="text-center py-4">
            <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h2 className="text-base font-bold text-gray-900">Check your email</h2>
            <p className="text-xs text-gray-500 mt-1">We sent a reset link to {email}</p>
            <Link to="/login" className="inline-block text-xs text-blue-600 font-medium mt-4 hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-900">Reset password</h1>
            <p className="text-gray-500 mb-6 text-xs">Enter your email and we'll send a link to reset your password.</p>

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  placeholder="you@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition"
              >
                {loading ? 'Sending…' : 'Send link'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 mt-6">
              Remembered your password?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
