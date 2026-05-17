import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { analysisApi } from '../api/services'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeft, CheckCircle, XCircle, Brain, Target,
  TrendingUp, AlertTriangle, Zap
} from 'lucide-react'

function ScoreRing({ score }) {
  const r = 58
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#6374f5' : score >= 30 ? '#f59e0b' : '#ef4444'
  const label = score >= 75 ? 'Excellent Match' : score >= 50 ? 'Good Match' : score >= 30 ? 'Fair Match' : 'Needs Work'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative inline-flex items-center justify-center">
        <svg width={140} height={140} className="-rotate-90" viewBox="0 0 140 140">
          <circle cx={70} cy={70} r={r} fill="none" stroke="#1e293b" strokeWidth={10}/>
          <circle
            cx={70} cy={70} r={r} fill="none" stroke={color} strokeWidth={10}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" className="score-ring-circle"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="font-display font-bold text-4xl text-slate-100">{score.toFixed(0)}</span>
          <span className="text-slate-400 text-xs font-medium">ATS Score</span>
        </div>
      </div>
      <span className="font-medium text-sm" style={{ color }}>{label}</span>
    </div>
  )
}

function KeywordChip({ word, matched }) {
  return (
    <span className={`keyword-chip gap-1 ${matched
      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      : 'bg-red-500/10 text-red-400 border border-red-500/20'
    }`}>
      {matched ? <CheckCircle size={9}/> : <XCircle size={9}/>}
      {word}
    </span>
  )
}

export default function AnalysisDetailPage() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('suggestions')

  useEffect(() => {
    analysisApi.getById(id)
      .then(res => setResult(res.data.data))
      .catch(() => toast.error('Failed to load analysis result'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )
  if (!result) return (
    <div className="text-center py-20 text-slate-400">
      <p>Analysis not found.</p>
      <Link to="/history" className="text-primary-400 hover:underline mt-2 inline-block">← Back to history</Link>
    </div>
  )

  const matchPct = result.matchedKeywords?.length > 0
    ? Math.round((result.matchedKeywords.length / (result.matchedKeywords.length + (result.missingKeywords?.length ?? 0))) * 100)
    : 0

  return (
    <div className="space-y-7 animate-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/history" className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors mt-1">
          <ArrowLeft size={18}/>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">{result.jobTitle}</h1>
          <p className="text-slate-400 text-sm mt-0.5">{result.companyName} · Resume: {result.resumeFileName}</p>
          <p className="text-xs text-slate-500 mt-1">
            Analyzed on {new Date(result.analyzedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Score + stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Score ring */}
        <div className="card p-7 flex items-center justify-center">
          <ScoreRing score={result.atsScore} />
        </div>

        {/* Stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {[
            {
              icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10',
              label: 'Matched Keywords', value: result.matchedKeywords?.length ?? 0,
            },
            {
              icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10',
              label: 'Missing Keywords', value: result.missingKeywords?.length ?? 0,
            },
            {
              icon: Target, color: 'text-blue-400', bg: 'bg-blue-400/10',
              label: 'Keyword Match Rate', value: `${matchPct}%`,
            },
            {
              icon: TrendingUp, color: 'text-primary-400', bg: 'bg-primary-400/10',
              label: 'ATS Score', value: `${result.atsScore.toFixed(1)}%`,
            },
          ].map(({ icon: Icon, color, bg, label, value }) => (
            <div key={label} className="stat-card">
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon size={15} className={color}/>
              </div>
              <div>
                <p className="font-display font-bold text-xl text-slate-100">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Matched */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-200 text-sm mb-3 flex items-center gap-2">
            <CheckCircle size={15} className="text-emerald-400"/> Matched Keywords
            <span className="ml-auto badge bg-emerald-500/15 text-emerald-400 text-xs">
              {result.matchedKeywords?.length ?? 0} found
            </span>
          </h3>
          {result.matchedKeywords?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.matchedKeywords.map(kw => <KeywordChip key={kw} word={kw} matched />)}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No keywords matched. Consider adding more relevant skills.</p>
          )}
        </div>

        {/* Missing */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-200 text-sm mb-3 flex items-center gap-2">
            <AlertTriangle size={15} className="text-red-400"/> Missing Keywords
            <span className="ml-auto badge bg-red-500/15 text-red-400 text-xs">
              {result.missingKeywords?.length ?? 0} missing
            </span>
          </h3>
          {result.missingKeywords?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords.map(kw => <KeywordChip key={kw} word={kw} matched={false} />)}
            </div>
          ) : (
            <p className="text-slate-500 text-sm flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400"/> All key skills found!
            </p>
          )}
        </div>
      </div>

      {/* Tabs: AI Suggestions / Skills Analysis */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-slate-800">
          {[
            { key: 'suggestions', icon: Brain, label: 'AI Suggestions' },
            { key: 'skills',      icon: Zap,   label: 'Skills Analysis' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors
                ${tab === key
                  ? 'text-primary-400 border-b-2 border-primary-500 bg-primary-600/5'
                  : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <Icon size={15}/>{label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'suggestions' && (
            <div className="ai-suggestions prose prose-invert max-w-none">
              {result.aiSuggestions ? (
                <ReactMarkdown>{result.aiSuggestions}</ReactMarkdown>
              ) : (
                <p className="text-slate-400 text-sm">No AI suggestions available.</p>
              )}
            </div>
          )}

          {tab === 'skills' && (
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
              {result.skillsAnalysis || 'No skills analysis available.'}
            </pre>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/analyze" className="btn-primary flex items-center gap-2 text-sm">
          <Zap size={14}/> Analyze Again
        </Link>
        <Link to="/history" className="btn-secondary text-sm">← Back to History</Link>
      </div>
    </div>
  )
}
