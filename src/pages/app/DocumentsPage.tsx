import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Upload, FileText, Trash2, ChevronRight, Plus, Loader2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useDocuments } from '../../hooks/useDocuments'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { formatBytes, formatDate } from '../../lib/utils'
import { PLAN_LIMITS, type Document } from '../../types'
import toast from 'react-hot-toast'

export default function DocumentsPage() {
  const { user } = useAuth()
  const { documents, loading, refresh } = useDocuments(user?.id)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const limits = PLAN_LIMITS.free

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return toast.error('Please upload a PDF file')
    }
    if (file.size > limits.max_file_bytes) {
      return toast.error(`File is too large (max ${formatBytes(limits.max_file_bytes)})`)
    }
    if (documents.length >= limits.documents) {
      return toast.error(`You have reached the maximum of ${limits.documents} documents.`)
    }

    setUploading(true)
    const toastId = toast.loading('Uploading PDF…')

    if (!isSupabaseConfigured) {
      const newDoc: Document = {
        id: 'doc-' + crypto.randomUUID(),
        user_id: user!.id,
        name: file.name,
        storage_path: 'local/' + file.name,
        mime_type: 'application/pdf',
        bytes: file.size,
        status: 'ready',
        page_count: Math.ceil(file.size / 120000) || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const current = JSON.parse(localStorage.getItem('docchat_local_docs') || '[]')
      localStorage.setItem('docchat_local_docs', JSON.stringify([newDoc, ...current]))
      setTimeout(() => {
        toast.success('Document uploaded!', { id: toastId })
        refresh()
        setUploading(false)
      }, 500)
      return
    }

    try {
      const { data: doc, error: docErr } = await supabase
        .from('documents')
        .insert({
          user_id: user!.id,
          name: file.name,
          bytes: file.size,
          status: 'uploaded',
        })
        .select()
        .single()
      if (docErr) throw docErr

      const storagePath = `${user!.id}/${doc.id}/original.pdf`
      const { error: storageErr } = await supabase.storage
        .from('pdfs')
        .upload(storagePath, file, { contentType: 'application/pdf' })
      if (storageErr) throw storageErr

      await supabase.from('documents').update({ storage_path: storagePath, status: 'processing' }).eq('id', doc.id)
      toast.success('Document uploaded! Processing started.', { id: toastId })
      refresh()
    } catch (err: any) {
      toast.error(err.message || 'Upload failed', { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Delete "${doc.name}"?`)) return
    if (!isSupabaseConfigured) {
      const current = JSON.parse(localStorage.getItem('docchat_local_docs') || '[]')
      const filtered = current.filter((d: Document) => d.id !== doc.id)
      localStorage.setItem('docchat_local_docs', JSON.stringify(filtered))
      toast.success('Deleted')
      refresh()
      return
    }

    try {
      if (doc.storage_path) await supabase.storage.from('pdfs').remove([doc.storage_path])
      await supabase.from('documents').delete().eq('id', doc.id)
      toast.success('Deleted')
      refresh()
    } catch (err: any) {
      toast.error(err.message || 'Could not delete')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Your Documents</h1>
          <p className="text-xs text-gray-500 mt-0.5">{documents.length} of {limits.documents} files stored</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Upload PDF
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {/* Upload Box */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
        }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition mb-6 ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
      >
        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-700">Drop a PDF here, or click to choose a file</p>
        <p className="text-xs text-gray-400 mt-1">Up to {formatBytes(limits.max_file_bytes)} each</p>
      </div>

      {/* Document list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium text-gray-600">No documents yet</p>
          <p className="text-xs text-gray-400 mt-1">Upload a PDF above to start asking questions.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center gap-3 hover:border-gray-300 transition"
            >
              <div className="w-9 h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <span>{formatBytes(doc.bytes)}</span>
                  <span>&bull;</span>
                  <span>{formatDate(doc.created_at)}</span>
                  {doc.status !== 'ready' && (
                    <span className="text-blue-600 font-medium ml-1">
                      {doc.status === 'processing' ? 'Processing…' : doc.status}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {doc.status === 'ready' ? (
                  <Link
                    to={`/app/documents/${doc.id}`}
                    className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition"
                  >
                    Chat <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                )}
                <button
                  onClick={() => handleDelete(doc)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Delete"
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
