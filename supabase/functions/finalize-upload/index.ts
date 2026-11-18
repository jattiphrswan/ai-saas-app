// supabase/functions/finalize-upload/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || ''
const GEMINI_EMBEDDING_MODEL = Deno.env.get('GEMINI_EMBEDDING_MODEL') || 'text-embedding-004'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ data: null, error: 'Unauthorized' }, 401)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authErr || !user) return json({ data: null, error: 'Unauthorized' }, 401)

    const { documentId } = await req.json()
    if (!documentId) return json({ data: null, error: 'documentId required' }, 400)

    // Check ownership
    const { data: doc, error: docErr } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docErr || !doc) return json({ data: null, error: 'Document not found' }, 404)

    // Download PDF from storage
    const { data: fileBlob, error: downloadErr } = await supabase.storage
      .from('pdfs')
      .download(doc.storage_path)

    if (downloadErr || !fileBlob) {
      await supabase.from('documents').update({ status: 'failed', error_code: 'FILE_NOT_FOUND' }).eq('id', doc.id)
      return json({ data: null, error: 'Storage file not found' }, 404)
    }

    await supabase.from('documents').update({ status: 'processing' }).eq('id', doc.id)

    // In a production server, use pdf-parse or pdfjs to extract text per page
    // For fast ingestion of text, let's extract plain text strings from the PDF buffer
    const arrayBuffer = await fileBlob.arrayBuffer()
    const textDecoder = new TextDecoder('utf-8', { fatal: false })
    const rawContent = textDecoder.decode(new Uint8Array(arrayBuffer))

    // Simple paragraph chunker
    const paragraphs = rawContent
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 50)

    const chunks = paragraphs.slice(0, 30) // Bound to max 30 chunks per doc for free tier
    const chunkInserts = []

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i].slice(0, 1000)
      let embedding: number[] | null = null

      if (GEMINI_API_KEY) {
        try {
          const embRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: `models/${GEMINI_EMBEDDING_MODEL}`,
                content: { parts: [{ text: chunkText }] },
              }),
            }
          )
          if (embRes.ok) {
            const embJson = await embRes.json()
            embedding = embJson.embedding?.values || null
          }
        } catch (e) {
          console.error('Embedding error on chunk', i, e)
        }
      }

      chunkInserts.push({
        document_id: doc.id,
        user_id: user.id,
        page_number: Math.floor(i / 3) + 1,
        chunk_index: i,
        content: chunkText,
        embedding,
      })
    }

    if (chunkInserts.length > 0) {
      await supabase.from('document_chunks').insert(chunkInserts)
    }

    await supabase.from('documents').update({ status: 'ready', page_count: Math.ceil(chunks.length / 3) || 1 }).eq('id', doc.id)

    return json({ data: { status: 'ready', chunkCount: chunkInserts.length }, error: null })
  } catch (err: any) {
    console.error('finalize-upload error:', err)
    return json({ data: null, error: err.message || 'Internal error' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
