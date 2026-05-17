import { useState, useEffect } from 'react'
import { jobApi } from '../api/services'
import toast from 'react-hot-toast'
import { Plus, FileText, Trash2, Building2, ChevronDown, ChevronUp, Loader } from 'lucide-react'

export default function JobDescriptionPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ jobTitle: '', companyName: '', description: '' })

  const loadJobs = async () => {
    try {
      const res = await jobApi.getAll()
      setJobs(res.data.data)
    } catch {
      toast.error('Failed to load job descriptions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadJobs() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.description.trim().length < 50) {
      toast.error('Job description must be at least 50 characters')
      return
    }
    setSaving(true)
    try {
      await jobApi.create(form)
      toast.success('Job description saved!')
      setForm({ jobTitle: '', companyName: '', description: '' })
      setShowForm(false)
      loadJobs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this job description?')) return
    try {
      await jobApi.deleteById(id)
      toast.success('Deleted successfully')
      setJobs(j => j.filter(x => x.id !== id))
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-8 animate-in max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-100">Job Descriptions</h1>
          <p className="text-slate-400 mt-1 text-sm">Save job postings to compare against your resume</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          {showForm ? 'Cancel' : 'Add New'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card p-6 animate-in border-primary-500/20">
          <h2 className="font-semibold text-slate-200 mb-5">New Job Description</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Job Title</label>
                <input
                  value={form.jobTitle}
                  onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))}
                  placeholder="e.g. Senior Backend Engineer"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Company Name</label>
                <input
                  value={form.companyName}
                  onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                  placeholder="e.g. Google"
                  required
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="label">
                Job Description
                <span className="text-slate-500 font-normal ml-1">({form.description.length} chars)</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Paste the full job description here. Include requirements, responsibilities, and skills needed…"
                required
                rows={10}
                className="input-field resize-y min-h-[200px]"
              />
              <p className="text-xs text-slate-500 mt-1">Paste the complete job posting for the most accurate ATS scoring</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <><Loader size={14} className="animate-spin" /> Saving…</> : 'Save Job Description'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={36} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400 font-medium">No job descriptions yet</p>
          <p className="text-slate-500 text-sm mt-1">Click "Add New" to save your first job posting</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="card overflow-hidden hover:border-slate-700 transition-colors">
              <div className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 size={16} className="text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200 text-sm">{job.jobTitle}</p>
                  <p className="text-xs text-slate-500">{job.companyName} · {new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                    className="p-2 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {expanded === job.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {expanded === job.id && (
                <div className="px-4 pb-4 border-t border-slate-800 pt-4">
                  <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {job.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
