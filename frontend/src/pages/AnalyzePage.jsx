import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { resumeApi, jobApi, analysisApi } from '../api/services'
import toast from 'react-hot-toast'
import { Zap, FileText, Building2, CheckCircle, Loader, AlertCircle } from 'lucide-react'

function SelectCard({ items, selected, onSelect, icon: Icon, iconColor, iconBg, emptyText, emptyLink, labelKey, subKey }) {
  if (items.length === 0) return (
    <div className="card p-6 text-center">
      <AlertCircle size={28} className="mx-auto text-slate-600 mb-2" />
      <p className="text-slate-400 text-sm">{emptyText}</p>
      <a href={emptyLink} className="text-primary-400 text-sm hover:underline mt-1 inline-block">Go add one →</a>
    </div>
  )
  return (
    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id === selected ? null : item.id)}
          className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-center gap-3
            ${item.id === selected
              ? 'border-primary-500/60 bg-primary-600/10'
              : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
            }`}
        >
          <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Icon size={15} className={iconColor} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{item[labelKey]}</p>
            <p className="text-xs text-slate-500 truncate">{item[subKey]}</p>
          </div>
          {item.id === selected && <CheckCircle size={16} className="text-primary-400 flex-shrink-0" />}
        </button>
      ))}
    </div>
  )
}

export default function AnalyzePage() {
  const [resumes, setResumes] = useState([])
  const [jobs, setJobs] = useState([])
  const [selectedResume, setSelectedResume] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, jRes] = await Promise.all([resumeApi.getAll(), jobApi.getAll()])
        setResumes(rRes.data.data)
        setJobs(jRes.data.data)
      } catch {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAnalyze = async () => {
    if (!selectedResume || !selectedJob) {
      toast.error('Please select both a resume and a job description')
      return
    }
    setAnalyzing(true)
    try {
      const res = await analysisApi.analyze({ resumeId: selectedResume, jobDescriptionId: selectedJob })
      toast.success('Analysis complete!')
      navigate(`/history/${res.data.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const canAnalyze = selectedResume && selectedJob && !analyzing

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8 animate-in max-w-3xl">
      <div className="card p-8 bg-gradient-to-r from-primary-600/20 to-purple-600/10">
  <h1 className="font-display text-4xl font-bold mb-3">
    AI Resume Analysis
  </h1>

  <p className="text-slate-300 text-lg leading-8 max-w-3xl">
    Compare your resume with any job description using AI.
    Receive an ATS compatibility score, keyword matching,
    missing skills, and personalized suggestions to improve
    your chances of getting shortlisted.
  </p>
</div>

      {/* Step 1 */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-xs font-bold text-white">1</span>
          <h2 className="font-semibold text-slate-200">Select Your Resume</h2>
          {selectedResume && <CheckCircle size={16} className="text-emerald-400 ml-auto" />}
        </div>
        <SelectCard
          items={resumes}
          selected={selectedResume}
          onSelect={setSelectedResume}
          icon={FileText}
          iconColor="text-blue-400"
          iconBg="bg-blue-400/10"
          emptyText="No resumes uploaded yet."
          emptyLink="/upload"
          labelKey="fileName"
          subKey="uploadedAt"
        />
      </div>

      {/* Step 2 */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-xs font-bold text-white">2</span>
          <h2 className="font-semibold text-slate-200">Select Job Description</h2>
          {selectedJob && <CheckCircle size={16} className="text-emerald-400 ml-auto" />}
        </div>
        <SelectCard
          items={jobs}
          selected={selectedJob}
          onSelect={setSelectedJob}
          icon={Building2}
          iconColor="text-purple-400"
          iconBg="bg-purple-400/10"
          emptyText="No job descriptions saved yet."
          emptyLink="/job-descriptions"
          labelKey="jobTitle"
          subKey="companyName"
        />
      </div>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!canAnalyze}
        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-semibold text-base transition-all duration-200
          ${canAnalyze
            ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/25 hover:shadow-primary-500/30'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
      >
        {analyzing ? (
          <><Loader size={20} className="animate-spin" /> Analyzing with AI… this may take a moment</>
        ) : (
          <><Zap size={20} /> Run ATS Analysis</>
        )}
      </button>

      {analyzing && (
        <div className="card p-5 border-primary-500/20 bg-primary-600/5 animate-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary-300">AI is analyzing your resume...</p>
              <p className="text-xs text-slate-400 mt-0.5">✓ Extracting Resume

✓ Matching Keywords

✓ Calculating ATS Score

✓ Generating AI Suggestions</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
