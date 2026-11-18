import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center">
      <div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-2">404</h1>
        <p className="text-sm text-gray-500 mb-6">This page doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>
      </div>
    </div>
  )
}
