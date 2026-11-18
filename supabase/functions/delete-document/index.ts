// supabase/functions/delete-document/index.ts
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
    if (!authHeader?.startsWith('Bearer ')) return json({ data: null, error: 'Unauthorized' }, 401)

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return json({ data: null, error: 'Unauthorized' }, 401)

    const { documentId } = await req.json()
    if (!documentId) return json({ data: null, error: 'documentId required' }, 400)

    const { data: doc } = await supabase
      .from('documents')
      .select('id, storage_path')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (!doc) return json({ data: null, error: 'Document not found' }, 404)

    // Remove file from storage
    if (doc.storage_path) {
      await supabase.storage.from('pdfs').remove([doc.storage_path])
    }

    // Cascade deletes chunks, conversations, messages via foreign keys
    await supabase.from('documents').delete().eq('id', doc.id)

    return json({ data: { deleted: true }, error: null })
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
