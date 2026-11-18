// supabase/functions/ask-question/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || ''
const GEMINI_GENERATION_MODEL = Deno.env.get('GEMINI_GENERATION_MODEL') || 'gemini-1.5-flash'
const GEMINI_EMBEDDING_MODEL = Deno.env.get('GEMINI_EMBEDDING_MODEL') || 'text-embedding-004'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const FREE_QUESTIONS_LIMIT = 2000
const PRO_QUESTIONS_LIMIT = 2000
const MAX_QUESTION_LENGTH = 1000
const TOP_CHUNKS = 6

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const requestId = crypto.randomUUID()

  try {
    // 1. Verify Authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ data: null, error: 'Missing or invalid authorization header', requestId }, 401)
    }

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
    if (authError || !user) {
      return json({ data: null, error: 'Unauthorized session', requestId }, 401)
    }

    // 2. Parse and validate input
    const body = await req.json()
    const { documentId, conversationId, question, requestKey } = body

    if (!documentId || typeof documentId !== 'string') {
      return json({ data: null, error: 'documentId is required', requestId }, 400)
    }
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return json({ data: null, error: 'question cannot be empty', requestId }, 400)
    }
    if (question.length > MAX_QUESTION_LENGTH) {
      return json({ data: null, error: `Question exceeds limit of ${MAX_QUESTION_LENGTH} characters`, requestId }, 400)
    }
    if (!requestKey) {
      return json({ data: null, error: 'requestKey is required for idempotency', requestId }, 400)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 3. Idempotency Guard
    const { data: existingEvent } = await supabase
      .from('usage_events')
      .select('id')
      .eq('request_key', requestKey)
      .maybeSingle()

    if (existingEvent) {
      return json({ data: null, error: 'Duplicate request already processed', requestId }, 409)
    }

    // 4. Verify Document Ownership and State
    const { data: doc, error: docErr } = await supabase
      .from('documents')
      .select('id, user_id, status, name')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (docErr || !doc) {
      return json({ data: null, error: 'Document not found or inaccessible', requestId }, 404)
    }
    if (doc.status !== 'ready') {
      return json({ data: null, error: 'Document is not ready for querying yet', requestId }, 409)
    }

    // 5. Enforce Usage Quotas
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan_code')
      .eq('user_id', user.id)
      .maybeSingle()

    const plan = sub?.plan_code || 'free'
    const limit = plan === 'pro' ? PRO_QUESTIONS_LIMIT : FREE_QUESTIONS_LIMIT

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('usage_events')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('event_type', 'question')
      .gte('occurred_at', startOfMonth.toISOString())

    if ((count || 0) >= limit) {
      return json(
        { data: null, error: `Monthly limit of ${limit} questions reached. Please upgrade to Pro.`, requestId },
        429
      )
    }

    // 6. Embed the question with Gemini Embedding Model
    const embeddingRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `models/${GEMINI_EMBEDDING_MODEL}`,
          content: { parts: [{ text: question.trim() }] },
        }),
      }
    )

    if (!embeddingRes.ok) {
      const err = await embeddingRes.text()
      console.error('Embedding error:', err)
      return json({ data: null, error: 'AI embedding service unavailable', requestId }, 502)
    }

    const embData = await embeddingRes.json()
    const questionEmbedding = embData.embedding?.values
    if (!questionEmbedding) {
      return json({ data: null, error: 'Failed to generate embedding', requestId }, 502)
    }

    // 7. Vector Similarity Search via RPC (Owner & Document isolated)
    const { data: chunks, error: searchErr } = await supabase.rpc('search_document_chunks', {
      query_embedding: questionEmbedding,
      match_document_id: documentId,
      match_user_id: user.id,
      match_count: TOP_CHUNKS,
    })

    if (searchErr) {
      console.error('Vector search error:', searchErr)
      return json({ data: null, error: 'Vector search error', requestId }, 500)
    }

    const retrievedChunks = chunks || []
    const retrievedChunkIds = new Set(retrievedChunks.map((c: any) => c.id))

    // 8. Grounded Generation Prompt
    const contextText = retrievedChunks
      .map(
        (c: any) =>
          `[source:${c.id}] Page ${c.page_number}:\n${c.content}`
      )
      .join('\n\n---\n\n')

    const systemPrompt = `You are an AI assistant answering questions about an uploaded PDF document.
CRITICAL RULES:
- Answer using ONLY the provided excerpts below. Never use external knowledge or invent facts.
- If the excerpts do not contain enough information, state: "The document does not contain enough information to answer this question."
- Whenever you use information from an excerpt, cite its source marker like [source:<chunk-id>].
- Do not cite markers that were not in the provided excerpts.
- Keep answers concise, factual, and direct.`

    const userPrompt = `DOCUMENT EXCERPTS:\n${contextText || 'No relevant excerpts found.'}\n\nUSER QUESTION: ${question.trim()}`

    const generationRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_GENERATION_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.1 },
        }),
      }
    )

    if (!generationRes.ok) {
      const err = await generationRes.text()
      console.error('Generation error:', err)
      return json({ data: null, error: 'AI generation service unavailable', requestId }, 502)
    }

    const genData = await generationRes.json()
    const rawAnswer = genData.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated.'

    // 9. Extract and strictly validate citations
    const citationRegex = /\[source:([^\]]+)\]/g
    const mentionedIds = [...rawAnswer.matchAll(citationRegex)].map((m) => m[1])
    const validatedIds = [...new Set(mentionedIds.filter((id) => retrievedChunkIds.has(id)))]

    const cleanAnswer = rawAnswer.replace(citationRegex, '').trim()
    const citations = validatedIds.map((chunkId) => {
      const chunk = retrievedChunks.find((c: any) => c.id === chunkId)
      return {
        documentId,
        pageNumber: chunk?.page_number || 1,
        chunkId,
      }
    })

    // 10. Persist Conversation & Messages
    let convId = conversationId
    if (!convId) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          document_id: documentId,
          title: question.slice(0, 50),
        })
        .select()
        .single()
      convId = newConv?.id
    }

    if (convId) {
      await supabase.from('messages').insert([
        {
          conversation_id: convId,
          user_id: user.id,
          role: 'user',
          body: question.trim(),
        },
        {
          conversation_id: convId,
          user_id: user.id,
          role: 'assistant',
          body: cleanAnswer,
          citations,
        },
      ])
    }

    // 11. Record Quota Usage Event
    await supabase.from('usage_events').insert({
      user_id: user.id,
      event_type: 'question',
      request_key: requestKey,
      units: 1,
    })

    return json(
      {
        data: {
          answer: cleanAnswer,
          citations,
          conversationId: convId,
          usage: { questionsRemaining: Math.max(0, limit - ((count || 0) + 1)) },
        },
        error: null,
        requestId,
      },
      200
    )
  } catch (err: any) {
    console.error('Unhandled ask-question error:', err)
    return json({ data: null, error: 'Internal server error', requestId }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
