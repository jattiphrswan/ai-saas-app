import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Upload, FileText, Trash2, ChevronRight, AlertCircle, Clock, CheckCircle, XCircle, Plus, Loader2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useDocuments } from '../../hooks/useDocuments'
import { useSubscription } from '../../hooks/useSubscription'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { formatBytes, formatDate } from '../../lib/utils'
import { PLAN_LIMITS, type Document } from '../../types'
import toast from 'react-hot-toast'

function StatusBadge({ status }: { status: Document['status'] }) {
  const map = {
    uploaded: { icon: Clock, label: 'Uploaded', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    processing: { icon: Loader2, label: 'Processing…', cls: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' },
    ready: { icon: CheckCircle, label: 'Ready', cls: 'bg-green-50 text-green-700 border-green-200' },
    failed: { icon: XCircle, label: 'Failed', cls: 'bg-red-50 text-red-700 border-red-200' },
  }
  const { icon: Icon, label, cls } = map[status] || map.uploaded
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      <Icon className={`w-3 h-3 ${status === 'processing' ? 'animate-spin' : ''}`} /> {label}
    </span>
  )
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const { documents, loading, refresh } = useDocuments(user?.id)
  const { plan } = useSubscription(user?.id)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const limits = PLAN_LIMITS[plan as 'free' | 'pro'] || PLAN_LIMITS.free
  const canUpload = documents.length < limits.documents

  const handleFile = async (file: File) => {
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF documents are supported')
      return
    }
    if (file.size > limits.max_file_bytes) {
      toast.error(`File size exceeds limit (${formatBytes(limits.max_file_bytes)} on ${plan} plan)`)
      return
    }
    if (!canUpload) {
      toast.error(`You have reached the maximum of ${limits.documents} documents. Delete older documents to add new ones.`)
      return
    }

    setUploading(true)
    const toastId = toast.loading('Uploading PDF…')

    if (!isSupabaseConfigured) {
      // Local preview mode
      const newDoc: Document = {
        id: 'doc-' + crypto.randomUUID(),
        user_id: user!.id,
        name: file.name,
        storage_path: 'local/' + file.name,
        mime_type: 'application/pdf',
        bytes: file.size,
        status: 'ready',
        page_count: Math.ceil(file.size / 100000) || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const current = JSON.parse(localStorage.getItem('docchat_local_docs') || '[]')
      localStorage.setItem('docchat_local_docs', JSON.stringify([newDoc, ...current]))
      setTimeout(() => {
        toast.success('Document uploaded and ready (Local Preview Mode)!', { id: toastId })
        refresh()
        setUploading(false)
      }, 600)
      return
    }

    try {
      // 1. Create document record
      const { data: doc, error: docErr } = await supabase
        .from('documents')
        .insert({
          user_id: user!.id,
          name: file.name,
          storage_path: '',
          mime_type: 'application/pdf',
          bytes: file.size,
          status: 'uploaded',
        })
        .select()
        .single()

      if (docErr) throw docErr

      // 2. Upload to private Storage bucket
      const storagePath = `${user!.id}/${doc.id}/original.pdf`
      const { error: storageErr } = await supabase.storage
        .from('pdfs')
        .upload(storagePath, file, { contentType: 'application/pdf' })

      if (storageErr) throw storageErr

      // 3. Update storage path and trigger processing
      await supabase
        .from('documents')
        .update({ storage_path: storagePath, status: 'processing' })
        .eq('id', doc.id)

      toast.success('Document uploaded! Processing started.', { id: toastId })
      refresh()
    } catch (err: any) {
      toast.error(err.message || 'Upload failed', { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) return
    const toastId = toast.loading('Deleting document…')

    if (!isSupabaseConfigured) {
      const current = JSON.parse(localStorage.getItem('docchat_local_docs') || '[]')
      const filtered = current.filter((d: Document) => d.id !== doc.id)
      localStorage.setItem('docchat_local_docs', JSON.stringify(filtered))
      toast.success('Document deleted', { id: toastId })
      refresh()
      return
    }

    try {
      if (doc.storage_path) {
        await supabase.storage.from('pdfs').remove([doc.storage_path])
      }
      const { error } = await supabase.from('documents').delete().eq('id', doc.id)
      if (error) throw error
      toast.success('Document deleted', { id: toastId })
      refresh()
    } catch (err: any) {
      toast.error(err.message || 'Delete failed', { id: toastId })
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 text-sm mt-1">
            {documents.length} of {limits.documents} document slots used ({plan} plan)
          </p>
        </div>
        <div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={!canUpload || uploading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Upload PDF
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      </div>

      {/* Quota Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-xs">
        <div className="flex items-center justify-between text-sm mb-2 font-medium">
          <span className="text-gray-700">Storage Slots</span>
          <span className="text-gray-500">{documents.length} / {limits.documents}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              documents.length >= limits.documents ? 'bg-amber-500' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min((documents.length / limits.documents) * 100, 100)}%` }}
          />
        </div>
        {!canUpload && (
          <p className="text-xs text-amber-700 mt-2.5 flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Maximum document capacity reached ({limits.documents} files). Delete an unused document to upload a new one.
          </p>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const f = e.dataTransfer.files[0]
          if (f) handleFile(f)
        }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition mb-6 ${
          dragOver ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-gray-700">Click to upload or drag and drop a PDF</p>
        <p className="text-xs text-gray-400 mt-1">Maximum size {formatBytes(limits.max_file_bytes)} per document</p>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-18 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl text-center py-16 px-4">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-base font-semibold text-gray-800">No documents yet</h3>
          <p className="text-sm text-gray-500 mt-1">Upload your first PDF document to begin chatting with it.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:border-blue-300 transition shadow-xs group"
            >
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate text-sm">{doc.name}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <StatusBadge status={doc.status} />
                  <span className="text-xs text-gray-400">{formatBytes(doc.bytes)}</span>
                  <span className="text-xs text-gray-400">{formatDate(doc.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {doc.status === 'ready' && (
                  <Link
                    to={`/app/documents/${doc.id}`}
                    className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                  >
                    Chat <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
                <button
                  onClick={() => handleDelete(doc)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
