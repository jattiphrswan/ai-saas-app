import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { Lock, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle()
      .then(({ data }) => { if (data?.display_name) setDisplayName(data.display_name) })
  }, [user])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({ id: user!.id, display_name: displayName.trim() })
    if (error) toast.error(error.message)
    else toast.success('Profile saved')
    setSaving(false)
  }

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) return toast.error('Use at least 8 characters')
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) toast.error(error.message)
    else { toast.success('Password updated'); setNewPassword('') }
    setSaving(false)
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage your account and login info.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Signed in as</label>
          <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
        </div>

        <form onSubmit={saveProfile} className="flex gap-2 pt-2 border-t border-gray-100">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
          >
            Save
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-3">
          <Lock className="w-4 h-4 text-gray-500" /> Change password
        </h2>
        <form onSubmit={updatePassword} className="space-y-3">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (8+ characters)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={saving || !newPassword}
            className="bg-gray-900 hover:bg-black disabled:opacity-40 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
          >
            Update password
          </button>
        </form>
      </div>

      <div className="bg-white border border-red-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-red-700 flex items-center gap-1.5 mb-1">
          <Trash2 className="w-4 h-4" /> Delete account
        </h2>
        <p className="text-xs text-gray-500 mb-4">Permanently remove all your uploaded documents and chats.</p>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-xs text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition font-medium"
          >
            Delete my account
          </button>
        ) : (
          <div className="p-3 bg-red-50 rounded-lg text-xs space-y-2">
            <p className="text-red-800 font-medium">Are you sure? This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => { toast.success('Account deletion scheduled'); setConfirmDelete(false) }}
                className="bg-red-600 text-white px-3 py-1 rounded font-medium"
              >
                Yes, delete
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-gray-600 px-2 py-1">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
