import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Send, Loader2, BookOpen, MessageSquare, Plus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { formatBytes } from '../../lib/utils'
import type { Document, Conversation, Message } from '../../types'
import toast from 'react-hot-toast'

export default function DocumentChatPage() {
  const { id: documentId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [doc, setDoc] = useState<Document | null>(null)
  const [convs, setConvs] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load document
  useEffect(() => {
    if (!documentId || !user) return
    if (!isSupabaseConfigured) {
      const docs: Document[] = JSON.parse(localStorage.getItem('docchat_local_docs') || '[]')
      setDoc(docs.find((d) => d.id === documentId) || docs[0] || null)
      setLoading(false)
      return
    }
    supabase.from('documents').select('*').eq('id', documentId).eq('user_id', user.id).single()
      .then(({ data }) => { setDoc(data); setLoading(false) })
  }, [documentId, user])

  // Load conversations
  useEffect(() => {
    if (!documentId || !user) return
    if (!isSupabaseConfigured) {
      const key = `docchat_convs_${documentId}`
      const saved: Conversation[] = JSON.parse(localStorage.getItem(key) || '[]')
      if (saved.length === 0) {
        const first: Conversation = {
          id: 'conv-1',
          user_id: user.id,
          document_id: documentId,
          title: 'Chat',
          created_at: new Date().toISOString(),
        }
        saved.push(first)
        localStorage.setItem(key, JSON.stringify(saved))
      }
      setConvs(saved)
      setActiveConvId(saved[0].id)
      return
    }
    supabase.from('conversations').select('*').eq('document_id', documentId).eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setConvs(data || [])
        if (data?.[0]) setActiveConvId(data[0].id)
      })
  }, [documentId, user])

  // Load messages
  useEffect(() => {
    if (!activeConvId) return setMessages([])
    if (!isSupabaseConfigured) {
      setMessages(JSON.parse(localStorage.getItem(`docchat_msgs_${activeConvId}`) || '[]'))
      return
    }
    supabase.from('messages').select('*').eq('conversation_id', activeConvId).order('created_at', { ascending: true })
      .then(({ data }) => setMessages((data as Message[]) || []))
  }, [activeConvId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const newChat = async () => {
    if (!documentId || !user) return
    if (!isSupabaseConfigured) {
      const created: Conversation = {
        id: 'conv-' + Date.now(),
        user_id: user.id,
        document_id: documentId,
        title: 'New conversation',
        created_at: new Date().toISOString(),
      }
      const updated = [created, ...convs]
      localStorage.setItem(`docchat_convs_${documentId}`, JSON.stringify(updated))
      setConvs(updated)
      setActiveConvId(created.id)
      setMessages([])
      return
    }
    const { data } = await supabase.from('conversations').insert({
      user_id: user.id, document_id: documentId, title: 'New conversation'
    }).select().single()
    if (data) {
      setConvs((p) => [data, ...p])
      setActiveConvId(data.id)
      setMessages([])
    }
  }

  const ask = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = question.trim()
    if (!q || sending || !doc || doc.status !== 'ready') return

    const convId = activeConvId || 'conv-1'
    const userMsg: Message = {
      id: crypto.randomUUID(),
      conversation_id: convId,
      user_id: user!.id,
      role: 'user',
      body: q,
      created_at: new Date().toISOString(),
    }

    setMessages((p) => [...p, userMsg])
    setQuestion('')
    setSending(true)

    if (!isSupabaseConfigured) {
      setTimeout(() => {
        const pageNum = Math.floor(Math.random() * (doc.page_count || 3)) + 1
        const aiMsg: Message = {
          id: crypto.randomUUID(),
          conversation_id: convId,
          user_id: user!.id,
          role: 'assistant',
          body: `Here is the relevant information from "${doc.name}":\n\nThe text on page ${pageNum} directly addresses "${q}". It explains the core points clearly and provides supporting details.`,
          citations: [{ documentId: doc.id, pageNumber: pageNum, chunkId: 'c1' }],
          created_at: new Date().toISOString(),
        }
        const updated = [...messages, userMsg, aiMsg]
        setMessages(updated)
        localStorage.setItem(`docchat_msgs_${convId}`, JSON.stringify(updated))
        setSending(false)
      }, 600)
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-question`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          conversationId: convId,
          question: q,
          requestKey: crypto.randomUUID(),
        }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setMessages((p) => [
        ...p,
        {
          id: crypto.randomUUID(),
          conversation_id: convId,
          user_id: user!.id,
          role: 'assistant',
          body: json.data.answer,
          citations: json.data.citations,
          created_at: new Date().toISOString(),
        },
      ])
    } catch (err: any) {
      toast.error(err.message || 'Could not get answer')
      setMessages((p) => p.filter((m) => m.id !== userMsg.id))
      setQuestion(q)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-sm text-gray-400">Loading document…</div>
  }

  if (!doc) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm text-gray-500">Document not found.</p>
        <Link to="/app/documents" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
          &larr; Back to documents
        </Link>
      </div>
    )
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-6.5rem)]">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-3">
        <Link to="/app/documents" className="flex items-center gap-1 text-xs text-gray-500 hover:text-black">
          <ArrowLeft className="w-3.5 h-3.5" /> All documents
        </Link>

        <div className="bg-white border border-gray-200 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{doc.name}</p>
              <p className="text-[10px] text-gray-400">{formatBytes(doc.bytes)}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden">
          <div className="p-2.5 border-b border-gray-100 flex items-center justify-between text-xs font-medium text-gray-600">
            <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Threads</span>
            <button onClick={newChat} className="p-1 hover:bg-gray-100 rounded text-gray-500" title="New chat">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
            {convs.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={`w-full text-left p-2 rounded-lg text-xs truncate transition ${
                  c.id === activeConvId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {c.title || 'Chat'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-gray-400">
              <div>
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium text-gray-600">Ask a question</p>
                <p className="text-xs text-gray-400 mt-0.5">Type below to get answers from this PDF.</p>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-gray-50 border border-gray-200 text-gray-800 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200/50 flex flex-wrap gap-1">
                      {m.citations.map((c, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 bg-white border border-gray-200 text-blue-700 text-[11px] font-medium px-2 py-0.5 rounded shadow-2xs"
                        >
                          <BookOpen className="w-3 h-3" /> Page {c.pageNumber}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {sending && (
            <div className="flex items-center gap-1 text-xs text-gray-400 pl-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={ask} className="border-t border-gray-100 p-3 flex gap-2 bg-gray-50/50">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything about this document…"
            className="flex-1 bg-white border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!question.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3.5 py-2 rounded-lg transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
