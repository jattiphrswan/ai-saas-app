import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Document } from '../types'

const DEFAULT_LOCAL_DOCS: Document[] = [
  {
    id: 'demo-doc-001',
    user_id: 'local-dev-user-001',
    name: 'Sample_AI_SaaS_Architecture.pdf',
    storage_path: 'local/demo-doc-001/original.pdf',
    mime_type: 'application/pdf',
    bytes: 1420000,
    page_count: 12,
    status: 'ready',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
]

export function useDocuments(userId?: string) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    if (!isSupabaseConfigured) {
      // Local preview mode
      const raw = localStorage.getItem('docchat_local_docs')
      if (raw) {
        try {
          setDocuments(JSON.parse(raw))
        } catch {
          setDocuments(DEFAULT_LOCAL_DOCS)
        }
      } else {
        localStorage.setItem('docchat_local_docs', JSON.stringify(DEFAULT_LOCAL_DOCS))
        setDocuments(DEFAULT_LOCAL_DOCS)
      }
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    else setDocuments(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { documents, loading, error, refresh: fetch }
}
