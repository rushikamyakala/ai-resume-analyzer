import { useTheme } from '../../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Upload, FileText, Zap, History,
  LogOut, Shield, ChevronRight, Brain
} from 'lucide-react'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload',           icon: Upload,          label: 'Upload Resume' },
  { to: '/job-descriptions', icon: FileText,        label: 'Job Descriptions' },
  { to: '/analyze',          icon: Zap,             label: 'Analyze' },
  { to: '/history',          icon: History,         label: 'History' },
]

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-surface-900 border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30">
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-slate-100 text-sm leading-tight">AI Resume</p>
              <p className="font-display font-bold text-primary-400 text-sm leading-tight">Analyzer</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={12} className="opacity-30" />
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} mt-2`}
            >
              <Shield size={16} />
              <span className="flex-1">Admin Panel</span>
              <ChevronRight size={12} className="opacity-30" />
            </NavLink>
          )}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-400 font-semibold text-xs">
                {user?.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
  onClick={toggleTheme}
  className="w-full nav-link mb-1"
>
  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
</button>

<button onClick={handleLogout} className="w-full nav-link text-red-400 hover:text-red-300 hover:bg-red-900/20">
  <LogOut size={15} />
  <span>Sign out</span>
</button>
          <button onClick={handleLogout} className="w-full nav-link text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-surface-950">
        <div className="p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
