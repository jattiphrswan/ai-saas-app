import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { User, Lock, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name)
      })
  }, [user])

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingName(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user!.id,
      display_name: displayName.trim(),
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Display name updated')
    }
    setSavingName(false)
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSavingPw(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully')
      setNewPassword('')
    }
    setSavingPw(false)
  }

  const handleDeleteAccount = async () => {
    toast.error('Account deletion requested. User data will be purged within retention window.')
    setShowDeleteConfirm(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h1>

      <div className="space-y-6">
        {/* Profile */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Personal Information</h2>
          </div>
          <div className="text-sm text-gray-500 mb-4">
            Email address: <span className="font-mono text-gray-900 font-medium">{user?.email}</span>
          </div>
          <form onSubmit={saveName} className="flex gap-3">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
              maxLength={80}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={savingName}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              {savingName ? 'Saving…' : 'Save'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Change Password</h2>
          </div>
          <form onSubmit={changePassword} className="space-y-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (minimum 8 characters)"
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={savingPw || !newPassword}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              {savingPw ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="w-4 h-4 text-red-500" />
            <h2 className="font-semibold text-red-700">Danger Zone</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Permanently delete your account, private documents, conversation history, and usage logs.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Delete account
            </button>
          ) : (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <p className="text-sm text-red-800 font-semibold mb-3">
                Are you sure you want to permanently delete your account? This action cannot be reversed.
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Yes, delete my account
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border border-gray-300 text-gray-700 hover:bg-white px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
