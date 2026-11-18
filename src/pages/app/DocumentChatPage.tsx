import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Send, Loader2, BookOpen, MessageSquare, Plus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { formatBytes, formatDate } from '../../lib/utils'
import type { Document, Conversation, Message, Citation } from '../../types'
import toast from 'react-hot-toast'

function CitationChip({ citation }: { citation: Citation }) {
  return (
    <span
      className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-md cursor-pointer transition font-medium border border-blue-200/60"
      title={`Page ${citation.pageNumber}`}
    >
      <BookOpen className="w-3 h-3" />
      Page {citation.pageNumber}
    </span>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center mr-2.5 mt-1 flex-shrink-0 text-white text-xs font-bold">
          AI
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-2xs ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-xs'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-xs'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.body}</p>
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-gray-400 font-medium">Sources:</span>
            {message.citations.map((c, i) => (
              <CitationChip key={i} citation={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DocumentChatPage() {
  const { id: documentId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [document, setDocument] = useState<Document | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingDoc, setLoadingDoc] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Fetch Document
  useEffect(() => {
    if (!documentId || !user) return

    if (!isSupabaseConfigured) {
      // Local preview mode
      const raw = localStorage.getItem('docchat_local_docs')
      const docs: Document[] = raw ? JSON.parse(raw) : []
      const found = docs.find((d) => d.id === documentId) || docs[0]
      if (found) {
        setDocument(found)
      } else {
        toast.error('Document not found')
      }
      setLoadingDoc(false)
      return
    }

    supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error('Document not found')
        } else {
          setDocument(data)
        }
        setLoadingDoc(false)
      })
  }, [documentId, user])

  // 2. Fetch Conversations
  useEffect(() => {
    if (!documentId || !user) return

    if (!isSupabaseConfigured) {
      const localConvsKey = `docchat_convs_${documentId}`
      const savedConvs: Conversation[] = JSON.parse(localStorage.getItem(localConvsKey) || '[]')
      if (savedConvs.length === 0) {
        const initialConv: Conversation = {
          id: 'local-conv-001',
          user_id: user.id,
          document_id: documentId,
          title: 'Initial questions',
          created_at: new Date().toISOString(),
        }
        savedConvs.push(initialConv)
        localStorage.setItem(localConvsKey, JSON.stringify(savedConvs))
      }
      setConversations(savedConvs)
      setActiveConvId(savedConvs[0].id)
      return
    }

    supabase
      .from('conversations')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setConversations(data || [])
        if (data && data.length > 0) {
          setActiveConvId(data[0].id)
        }
      })
  }, [documentId, user])

  // 3. Fetch Messages for active conversation
  useEffect(() => {
    if (!activeConvId) {
      setMessages([])
      return
    }

    if (!isSupabaseConfigured) {
      const localMsgKey = `docchat_msgs_${activeConvId}`
      const savedMsgs: Message[] = JSON.parse(localStorage.getItem(localMsgKey) || '[]')
      setMessages(savedMsgs)
      return
    }

    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', activeConvId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages((data as Message[]) || []))
  }, [activeConvId])

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const createConversation = async () => {
    if (!documentId || !user) return

    if (!isSupabaseConfigured) {
      const newConv: Conversation = {
        id: 'conv-' + crypto.randomUUID(),
        user_id: user.id,
        document_id: documentId,
        title: 'New conversation',
        created_at: new Date().toISOString(),
      }
      const localConvsKey = `docchat_convs_${documentId}`
      const prev: Conversation[] = JSON.parse(localStorage.getItem(localConvsKey) || '[]')
      const updated = [newConv, ...prev]
      localStorage.setItem(localConvsKey, JSON.stringify(updated))
      setConversations(updated)
      setActiveConvId(newConv.id)
      setMessages([])
      return
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        document_id: documentId,
        title: 'New conversation',
      })
      .select()
      .single()

    if (error) {
      toast.error(error.message)
      return
    }
    setConversations((prev) => [data, ...prev])
    setActiveConvId(data.id)
    setMessages([])
  }

  const sendQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || sending || !document || document.status !== 'ready') return

    let convId = activeConvId
    if (!convId) {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user!.id,
          document_id: documentId!,
          title: question.slice(0, 50),
        })
        .select()
        .single()
      if (error) {
        toast.error(error.message)
        return
      }
      convId = data.id
      setConversations((prev) => [data, ...prev])
      setActiveConvId(convId)
    }

    const safeConvId = convId || ''
    const currentQuestion = question.trim()
    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: safeConvId,
      user_id: user!.id,
      role: 'user',
      body: currentQuestion,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setQuestion('')
    setSending(true)

    if (!isSupabaseConfigured) {
      setTimeout(() => {
        const localAnswers: Record<string, { body: string; page: number }> = {
          default: {
            body: `Based on the document "${document.name}", here is the excerpt matching your query "${currentQuestion}":\n\nThe system utilizes pgvector cosine similarity matching and row-level security (RLS) to ensure multi-tenant isolation and accurate source grounding without hallucinated references.`,
            page: Math.floor(Math.random() * (document.page_count || 5)) + 1,
          },
        }
        const match = localAnswers.default
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          conversation_id: safeConvId,
          user_id: user!.id,
          role: 'assistant',
          body: match.body,
          citations: [
            {
              documentId: document.id,
              pageNumber: match.page,
              chunkId: 'chunk-' + crypto.randomUUID(),
            },
          ],
          created_at: new Date().toISOString(),
        }
        const updated = [...messages, userMessage, aiMessage]
        setMessages(updated)
        const localMsgKey = `docchat_msgs_${safeConvId}`
        localStorage.setItem(localMsgKey, JSON.stringify(updated))
        setSending(false)
      }, 700)
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

      const res = await fetch(`${supabaseUrl}/functions/v1/ask-question`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          conversationId: safeConvId,
          question: currentQuestion,
          requestKey: crypto.randomUUID(),
        }),
      })

      const json = await res.json()
      if (json.error) throw new Error(json.error)

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: safeConvId,
        user_id: user!.id,
        role: 'assistant',
        body: json.data.answer,
        citations: json.data.citations,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate answer')
      // Revert if error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
      setQuestion(currentQuestion)
    } finally {
      setSending(false)
    }
  }

  if (loadingDoc) {
    return (
      <div className="flex items-center justify-center h-72">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 font-medium">Document not found.</p>
        <Link to="/app/documents" className="text-blue-600 hover:underline text-sm mt-3 inline-block font-semibold">
          ← Back to documents
        </Link>
      </div>
    )
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left panel: Info & Threads */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-4">
        <Link
          to="/app/documents"
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All documents
        </Link>

        {/* Document Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate" title={document.name}>
                {document.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{formatBytes(document.bytes)}</p>
            </div>
          </div>
          {document.status !== 'ready' && (
            <div
              className={`mt-3 text-xs px-2.5 py-1.5 rounded-lg font-medium ${
                document.status === 'processing'
                  ? 'bg-blue-50 text-blue-700'
                  : document.status === 'failed'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-yellow-50 text-yellow-700'
              }`}
            >
              {document.status === 'processing'
                ? '⏳ Ingestion in progress…'
                : document.status === 'failed'
                ? '❌ Ingestion failed'
                : '⏳ Pending…'}
            </div>
          )}
        </div>

        {/* Conversation list */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden shadow-xs">
          <div className="p-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Threads
            </span>
            <button
              onClick={createConversation}
              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900 transition cursor-pointer"
              title="New thread"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No threads yet</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition cursor-pointer ${
                    conv.id === activeConvId
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <p className="truncate">{conv.title || 'Conversation'}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(conv.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right panel: Chat messages */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
        {document.status !== 'ready' ? (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 text-base">Processing document</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                We are extracting text, creating semantic chunks, and indexing embeddings. This takes just a few seconds.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700">Ask a question</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Ask anything about "{document.name}". Answers will reference specific pages.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
              )}

              {sending && (
                <div className="flex justify-start mb-4">
                  <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center mr-2.5 text-white text-xs font-bold">
                    AI
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-xs px-4 py-3 shadow-2xs">
                    <div className="flex gap-1.5 py-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={sendQuestion} className="border-t border-gray-100 p-4 flex gap-3 bg-gray-50/50">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about this document…"
                className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={sending}
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={!question.trim() || sending}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition cursor-pointer"
                title="Send question"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
