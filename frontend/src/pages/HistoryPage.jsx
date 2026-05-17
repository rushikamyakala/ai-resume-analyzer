import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { analysisApi } from '../api/services'
import toast from 'react-hot-toast'
import { History, ArrowRight, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react'

function ScoreBadge({ score }) {
  if (score >= 75) return <span className="badge bg-emerald-500/15 text-emerald-400"><CheckCircle size={11}/> Excellent</span>
  if (score >= 50) return <span className="badge bg-blue-500/15 text-blue-400"><CheckCircle size={11}/> Good</span>
  if (score >= 30) return <span className="badge bg-yellow-500/15 text-yellow-400"><AlertTriangle size={11}/> Fair</span>
  return <span className="badge bg-red-500/15 text-red-400"><XCircle size={11}/> Needs Work</span>
}

function ScoreCircle({ score }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#6374f5' : score >= 30 ? '#f59e0b' : '#ef4444'
  const r = 22, circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div className="relative inline-flex items-center justify-center w-14 h-14 flex-shrink-0">
      <svg width={56} height={56} className="-rotate-90" viewBox="0 0 56 56">
        <circle cx={28} cy={28} r={r} fill="none" stroke="#1e293b" strokeWidth={5}/>
        <circle cx={28} cy={28} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"/>
      </svg>
      <span className="absolute font-bold text-xs text-slate-100">{score.toFixed(0)}%</span>
    </div>
  )
}

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analysisApi.getHistory()
      .then(res => setHistory(res.data.data))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-100">Analysis History</h1>
        <p className="text-slate-400 mt-1 text-sm">{history.length} total {history.length === 1 ? 'analysis' : 'analyses'}</p>
      </div>

      {history.length === 0 ? (
        <div className="card p-16 text-center">
          <Clock size={40} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-300 font-medium">No analyses yet</p>
          <p className="text-slate-500 text-sm mt-1">Run your first analysis to see results here</p>
          <Link to="/analyze" className="btn-primary inline-flex items-center gap-2 mt-5 text-sm px-5 py-2.5">
            <History size={15}/> Start Analyzing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(item => (
            <Link
              key={item.id}
              to={`/history/${item.id}`}
              className="card flex items-center gap-4 p-4 hover:border-slate-700 transition-all duration-150 group hover:bg-slate-900/50"
            >
              <ScoreCircle score={item.atsScore} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-slate-200 text-sm">{item.jobTitle}</p>
                  <span className="text-slate-600 text-xs">at</span>
                  <p className="text-sm text-slate-400">{item.companyName}</p>
                  <ScoreBadge score={item.atsScore} />
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">Resume: {item.resumeFileName}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span>{item.matchedKeywords?.length ?? 0} keywords matched</span>
                  <span>·</span>
                  <span>{item.missingKeywords?.length ?? 0} missing</span>
                  <span>·</span>
                  <span>{new Date(item.analyzedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <ArrowRight size={15} className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
