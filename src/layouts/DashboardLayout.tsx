import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { FileText, BarChart2, CreditCard, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/app/documents', icon: FileText, label: 'Documents' },
  { to: '/app/usage', icon: BarChart2, label: 'Usage' },
  { to: '/app/billing', icon: CreditCard, label: 'Billing' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
]

export default function DashboardLayout() {
  const { user, signOut, isLocalMode } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="DocChat AI" className="w-8 h-8 rounded-lg object-contain shadow-xs" />
            <span className="font-bold text-gray-900 text-lg">DocChat AI</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          {isLocalMode && (
            <div className="mb-2.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 font-medium">
              ⚡ Local Preview Mode
            </div>
          )}
          <div className="text-xs text-gray-500 mb-3 truncate font-mono">{user?.email}</div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors w-full cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
