import { Link } from 'react-router-dom'
import { Zap, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-6 h-6" />
        </div>
        <h1 className="text-6xl font-extrabold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Page not found</h2>
        <p className="text-sm text-gray-500 mb-6">The page you are looking for does not exist or has been moved.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> Go back home
        </Link>
      </div>
    </div>
  )
}
