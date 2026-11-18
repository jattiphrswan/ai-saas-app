export type DocumentStatus = 'uploaded' | 'processing' | 'ready' | 'failed'
export type PlanCode = 'free' | 'pro'
export type MessageRole = 'user' | 'assistant'

export interface Document {
  id: string
  user_id: string
  name: string
  storage_path: string
  mime_type: string
  bytes: number
  page_count?: number
  status: DocumentStatus
  error_code?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  document_id: string
  title?: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  user_id: string
  role: MessageRole
  body: string
  citations?: Citation[]
  created_at: string
}

export interface Citation {
  documentId: string
  pageNumber: number
  chunkId: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_code: PlanCode
  status: string
  current_period_end?: string
  cancel_at_period_end: boolean
}

export const PLAN_LIMITS = {
  free: { documents: 50, questions_per_month: 2000, max_file_bytes: 25 * 1024 * 1024 },
  pro:  { documents: 50, questions_per_month: 2000, max_file_bytes: 25 * 1024 * 1024 },
} as const
