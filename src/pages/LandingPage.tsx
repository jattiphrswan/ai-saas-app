import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Lock, Search } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <img src="/favicon.png" alt="DocChat" className="w-7 h-7 rounded" />
          <span>DocChat AI</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/pricing" className="text-gray-600 hover:text-black">Features</Link>
          <Link to="/login" className="text-gray-600 hover:text-black">Sign in</Link>
          <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg transition">
            Try it free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-16 text-center">
        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Free PDF Assistant
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Ask questions to your PDFs. <br />
          <span className="text-blue-600">Get answers with page numbers.</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
          Upload any contract, research paper, or manual. Get clear answers without scanning dozens of pages yourself.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 shadow-xs transition">
            Start reading for free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <p className="mt-3 text-xs text-gray-400">No card required &bull; Completely free</p>

        {/* Preview snippet */}
        <div className="mt-12 p-4 sm:p-6 bg-gray-50 border border-gray-200 rounded-2xl text-left max-w-xl mx-auto space-y-3">
          <div className="text-xs font-mono text-gray-400 border-b border-gray-200 pb-2">Sample_Report.pdf</div>
          <div className="bg-blue-600 text-white text-sm p-3 rounded-xl max-w-sm ml-auto">
            What was the total growth reported?
          </div>
          <div className="bg-white border border-gray-200 text-gray-800 text-sm p-3 rounded-xl max-w-sm">
            Revenue grew by 24% year-over-year to $4.2M.
            <div className="mt-2 text-xs font-semibold text-blue-700 bg-blue-50 inline-flex items-center gap-1 px-2 py-0.5 rounded">
              <BookOpen className="w-3 h-3" /> Page 7
            </div>
          </div>
        </div>
      </section>

      {/* 3 Simple Points */}
      <section className="max-w-4xl mx-auto px-4 py-16 grid sm:grid-cols-3 gap-6 border-t border-gray-100">
        <div className="p-4">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3">
            <Search className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-base mb-1">Find facts in seconds</h3>
          <p className="text-sm text-gray-500">Ask in regular words. The AI finds the exact paragraphs matching what you need.</p>
        </div>
        <div className="p-4">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3">
            <BookOpen className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-base mb-1">Exact page citations</h3>
          <p className="text-sm text-gray-500">Every response tells you exactly which page it came from so you can double check.</p>
        </div>
        <div className="p-4">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-base mb-1">Private by design</h3>
          <p className="text-sm text-gray-500">Your documents stay tied to your account. Nobody else can view or query your files.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} DocChat AI. Free and open for everyone.
      </footer>
    </div>
  )
}
