import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      navigate(data.session ? '/app' : '/login')
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xs text-gray-400">
      Logging in…
    </div>
  )
}
