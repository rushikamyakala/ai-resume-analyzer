import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { analysisApi } from '../api/services'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import {
  FileText, Zap, BarChart2, TrendingUp, Upload, ArrowRight,
  Clock, CheckCircle, AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

function ScoreRing({ score }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#6374f5' : score >= 30 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={100} height={100} className="-rotate-90">
        <circle cx={50} cy={50} r={r} fill="none" stroke="#1e293b" strokeWidth={8} />
        <circle
          cx={50} cy={50} r={r} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="score-ring-circle transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-lg text-slate-100">{score.toFixed(0)}%</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, histRes] = await Promise.all([
          analysisApi.getDashboard(),
          analysisApi.getHistory(),
        ])
        setStats(statsRes.data.data)
        setHistory(histRes.data.data.slice(0, 5))
      } catch {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const chartData = history.map(h => ({
    name: h.jobTitle.length > 12 ? h.jobTitle.slice(0, 12) + '…' : h.jobTitle,
    score: h.atsScore,
  })).reverse()

  const scoreColor = (s) =>
    s >= 75 ? '#10b981' : s >= 50 ? '#6374f5' : s >= 30 ? '#f59e0b' : '#ef4444'

  const scoreLabel = (s) =>
    s >= 75 ? 'Excellent' : s >= 50 ? 'Good' : s >= 30 ? 'Fair' : 'Needs Work'

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-100">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="text-primary-400">{user?.fullName?.split(' ')[0]}</span>
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Here's your resume analysis overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Resumes', value: stats?.totalResumes ?? 0,        icon: FileText,  color: 'text-blue-400',    bg: 'bg-blue-400/10' },
          { label: 'Analyses',value: stats?.totalAnalyses ?? 0,       icon: Zap,       color: 'text-primary-400', bg: 'bg-primary-400/10' },
          { label: 'Jobs',    value: stats?.totalJobDescriptions ?? 0, icon: BarChart2, color: 'text-purple-400',  bg: 'bg-purple-400/10' },
          { label: 'Best Score',value: `${(stats?.highestAtsScore ?? 0).toFixed(0)}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="section-title mb-5">ATS Score Trend</h2>
          {chartData.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center gap-3 text-slate-500">
              <BarChart2 size={32} className="opacity-30" />
              <p className="text-sm">No analysis data yet</p>
              <Link to="/analyze" className="btn-primary text-sm px-4 py-2">Run First Analysis</Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#f1f5f9' }}
                  formatter={(v) => [`${v.toFixed(1)}%`, 'ATS Score']}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={scoreColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick actions */}
        <div className="card p-6 flex flex-col gap-4">
          <h2 className="section-title">Quick Actions</h2>
          {[
            { to: '/upload',           icon: Upload,   label: 'Upload Resume',      sub: 'Add a new PDF resume' },
            { to: '/job-descriptions', icon: FileText, label: 'Add Job Description', sub: 'Paste a job posting' },
            { to: '/analyze',          icon: Zap,      label: 'Run Analysis',        sub: 'Get your ATS score' },
          ].map(({ to, icon: Icon, label, sub }) => (
            <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/60 transition-colors group">
              <div className="w-9 h-9 bg-primary-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200">{label}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </div>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent analyses */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">Recent Analyses</h2>
          <Link to="/history" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <Clock size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No analyses yet. Upload a resume and run your first analysis!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <Link key={item.id} to={`/history/${item.id}`}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50 group"
              >
                <ScoreRing score={item.atsScore} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200 text-sm truncate">{item.jobTitle} — {item.companyName}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{item.resumeFileName}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {item.atsScore >= 50
                      ? <CheckCircle size={12} className="text-emerald-400" />
                      : <AlertTriangle size={12} className="text-yellow-400" />
                    }
                    <span className="text-xs" style={{ color: scoreColor(item.atsScore) }}>
                      {scoreLabel(item.atsScore)}
                    </span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-xs text-slate-500">
                      {new Date(item.analyzedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 flex-shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
