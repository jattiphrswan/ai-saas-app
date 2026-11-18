import { Link } from 'react-router-dom'
import { Zap, Lock, MessageSquare, BookOpen, Upload, Search, FileCheck, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="DocChat AI" className="w-8 h-8 rounded-lg object-contain shadow-xs" />
            <span className="font-bold text-gray-900 text-lg">DocChat AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition">Features</a>
            <Link to="/pricing" className="hover:text-gray-900 transition font-medium text-blue-600">Free Forever</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Sign in</Link>
            <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50/60 via-white to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" />
            100% Free · Powered by Gemini RAG
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
            Chat with your PDFs.<br />
            <span className="text-blue-600">Get answers with citations.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload any PDF, ask questions in plain English, and get AI-powered answers grounded strictly in your documents with exact page citations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition flex items-center justify-center gap-2 shadow-sm">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/pricing" className="border border-gray-300 hover:border-gray-400 bg-white text-gray-700 font-semibold px-8 py-3.5 rounded-xl text-base transition">
              Explore Free Features
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">100% Free &bull; No paid subscriptions &bull; No credit card required</p>

          {/* Mock UI preview */}
          <div className="mt-14 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-2xl mx-auto text-left">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-100">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-xs text-gray-400 ml-2 font-mono">Quarterly_Report_2026.pdf</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white text-sm rounded-xl px-4 py-2.5 max-w-md">
                  What was the net revenue growth mentioned in section 3?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-3 max-w-md">
                  According to section 3, net revenue grew by 24% year-over-year to $4.2M, driven primarily by enterprise subscriptions.
                  <div className="mt-2 flex gap-1">
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      <BookOpen className="w-3 h-3" /> Page 7
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Engineered for accuracy & privacy</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto text-sm">Every query is backed by vector similarity search and server-side isolation.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: 'Row-Level Isolation', desc: 'PostgreSQL Row Level Security ensures only you can access, vectorize, and search your uploaded PDFs.' },
              { icon: MessageSquare, title: 'AI-Powered Q&A', desc: 'Ask questions in plain English. Gemini reads your relevant excerpts and produces grounded answers.' },
              { icon: BookOpen, title: 'Verifiable Citations', desc: 'No hallucinated page numbers. Every source excerpt is referenced with its exact 1-based page.' },
              { icon: Upload, title: 'Instant Ingestion', desc: 'Automatic text extraction, semantic chunking, and embedding creation within seconds.' },
              { icon: Search, title: 'Vector Search', desc: 'Powered by pgvector with cosine distance indexing for semantic accuracy over keyword matching.' },
              { icon: FileCheck, title: 'Full Conversation History', desc: 'Store multiple conversation threads per document and resume where you left off.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-xl border border-gray-200/80 bg-white hover:border-blue-200 hover:shadow-sm transition">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <img src="/favicon.png" alt="DocChat AI" className="w-5 h-5 rounded object-contain" /> DocChat AI
          </div>
          <div className="flex gap-6">
            <Link to="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link to="/login" className="hover:text-gray-900">Sign In</Link>
            <Link to="/signup" className="hover:text-gray-900">Get Started</Link>
          </div>
          <p className="text-xs text-gray-400">© 2026 DocChat AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
