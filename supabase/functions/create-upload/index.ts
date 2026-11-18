// supabase/functions/create-upload/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

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

    const { filename, bytes, mimeType } = await req.json()
    if (!filename || typeof filename !== 'string') return json({ data: null, error: 'filename required' }, 400)
    if (mimeType !== 'application/pdf' && !filename.toLowerCase().endsWith('.pdf')) {
      return json({ data: null, error: 'Only PDF files supported' }, 400)
    }

    // Check plan quota
    const { data: sub } = await supabase.from('subscriptions').select('plan_code').eq('user_id', user.id).maybeSingle()
    const plan = sub?.plan_code || 'free'
    const maxDocs = plan === 'pro' ? 50 : 3
    const maxBytes = plan === 'pro' ? 20 * 1024 * 1024 : 5 * 1024 * 1024

    if (bytes > maxBytes) {
      return json({ data: null, error: `File exceeds plan size limit` }, 413)
    }

    const { count } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count || 0) >= maxDocs) {
      return json({ data: null, error: `Document slot limit reached (${maxDocs})` }, 429)
    }

    // Create pending document row
    const { data: doc, error: docErr } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name: filename,
        mime_type: 'application/pdf',
        bytes: bytes || 0,
        status: 'uploaded',
      })
      .select()
      .single()

    if (docErr) throw docErr

    // Generate signed upload path
    const storagePath = `${user.id}/${doc.id}/original.pdf`
    const { data: signedData, error: signErr } = await supabase.storage
      .from('pdfs')
      .createSignedUploadUrl(storagePath)

    if (signErr) throw signErr

    await supabase.from('documents').update({ storage_path: storagePath }).eq('id', doc.id)

    return json({
      data: {
        documentId: doc.id,
        storagePath,
        uploadUrl: signedData.signedUrl,
        token: signedData.token,
      },
      error: null,
    })
  } catch (err: any) {
    return json({ data: null, error: err.message || 'Internal error' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
