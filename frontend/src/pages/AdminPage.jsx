import { useEffect, useState } from 'react'
import { adminApi } from '../api/services'
import toast from 'react-hot-toast'
import { Shield, Users, FileText, BarChart2 } from 'lucide-react'

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminApi.getStats(), adminApi.getUsers()])
      .then(([sRes, uRes]) => {
        setStats(sRes.data.data)
        setUsers(uRes.data.data)
      })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 animate-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-amber-400" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-100">Admin Panel</h1>
          <p className="text-slate-400 text-sm">System overview and user management</p>
        </div>
      </div>

      {/* System stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users',    value: stats?.totalUsers ?? 0,    icon: Users,    color: 'text-blue-400',    bg: 'bg-blue-400/10' },
          { label: 'Total Resumes',  value: stats?.totalResumes ?? 0,  icon: FileText, color: 'text-purple-400',  bg: 'bg-purple-400/10' },
          { label: 'Total Analyses', value: stats?.totalAnalyses ?? 0, icon: BarChart2,color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
              <Icon size={17} className={color} />
            </div>
            <div>
              <p className="font-display font-bold text-2xl text-slate-100">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="font-semibold text-slate-200">All Users ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['ID', 'Name', 'Email', 'Role', 'Resumes', 'Joined'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3 text-slate-500 font-mono text-xs">{u.id}</td>
                  <td className="px-5 py-3 text-slate-200 font-medium">{u.fullName}</td>
                  <td className="px-5 py-3 text-slate-400">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${u.role === 'ADMIN'
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-slate-700 text-slate-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400">{u.resumeCount}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
