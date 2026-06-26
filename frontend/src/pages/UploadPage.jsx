import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { resumeApi } from '../api/services'
import toast from 'react-hot-toast'
import { Upload, FileText, X, CheckCircle, Loader, Pencil, Trash2, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(null)
  const [resumes, setResumes] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const navigate = useNavigate()

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast.error('Only PDF files under 10MB are accepted')
      return
    }
    if (accepted.length > 0) {
      setFile(accepted[0])
      setUploaded(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const res = await resumeApi.upload(file)
      setUploaded(res.data.data)
      setFile(null)
      toast.success('Resume uploaded and text extracted successfully!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please try again.'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  const loadResumes = async () => {
    try {
      const res = await resumeApi.getAll()
      setResumes(res.data.data)
    } catch {
      toast.error('Failed to load resumes')
    }
  }

  useEffect(() => { loadResumes() }, [uploaded])

  const handleRename = async (id) => {
    try {
      await resumeApi.rename(id, editName)
      toast.success('Renamed successfully!')
      setEditingId(null)
      loadResumes()
    } catch {
      toast.error('Failed to rename')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume?')) return
    try {
      await resumeApi.deleteById(id)
      toast.success('Deleted!')
      loadResumes()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-8 animate-in max-w-2xl">
      <div>
        <div className="card p-8 bg-gradient-to-r from-primary-600/20 to-indigo-600/10">
    <h1 className="font-display text-4xl font-bold mb-3">
        Upload Your Resume
    </h1>

    <p className="text-slate-400 max-w-3xl text-lg leading-8">
        Upload your resume in PDF format. Our AI extracts the content,
        understands your skills, and prepares it for ATS analysis,
        keyword matching, and personalized improvement suggestions.
    </p>
</div>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`card cursor-pointer p-16 text-center transition-all duration-200 border-2 border-dashed
          ${isDragActive
            ? 'border-primary-500 bg-primary-600/10'
            : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/30'
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center transition-colors
            ${isDragActive ? 'bg-primary-600/30' : 'bg-slate-800'}`}>
            <Upload size={42} className={isDragActive ? 'text-primary-400' : 'text-slate-400'} />
          </div>
          {isDragActive ? (
            <p className="text-primary-400 font-medium">Drop your PDF here!</p>
          ) : (
            <>
              <div>
                <p className="font-medium text-slate-200">Drag & drop your resume here</p>
                <p className="text-sm text-slate-500 mt-1">or click to browse files</p>
              </div>
              <p className="text-xs text-slate-600 bg-slate-800 px-3 py-1.5 rounded-full">
                PDF only · Max 10MB · Text-based PDFs only (not scanned)
              </p>
            </>
          )}
        </div>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

  <div className="card p-5 text-center">
    <p className="text-3xl font-bold text-primary-400">
      {resumes.length}
    </p>
    <p className="text-slate-400 mt-2">
      Uploaded Resumes
    </p>
  </div>

  <div className="card p-5 text-center">
    <p className="text-3xl font-bold text-emerald-400">
      PDF
    </p>
    <p className="text-slate-400 mt-2">
      Supported Format
    </p>
  </div>

  <div className="card p-5 text-center">
    <p className="text-3xl font-bold text-yellow-400">
      AI
    </p>
    <p className="text-slate-400 mt-2">
      Smart Text Extraction
    </p>
  </div>

</div>
      {/* Selected file */}
      {file && (
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
            <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-slate-500 hover:text-red-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Upload button */}
      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {uploading ? (
            <><Loader size={16} className="animate-spin" /> Uploading & Extracting Text...</>
          ) : (
            <><Upload size={16} /> Upload Resume</>
          )}
        </button>
      )}

      {/* Success */}
      {uploaded && (
        <div className="card p-6 border-emerald-500/30 bg-emerald-500/5 animate-in">
          <div className="flex items-start gap-4">
            <CheckCircle size={22} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-emerald-300">Resume Ready for AI Analysis 🚀</p>
              <p className="text-sm text-slate-400 mt-1">
                <span className="font-medium text-slate-300">{uploaded.fileName}</span> is ready for analysis.
              </p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => navigate('/analyze')} className="btn-primary text-sm px-4 py-2">
                  Start ATS Analysis →
                </button>
                <button onClick={() => setUploaded(null)} className="btn-secondary text-sm px-4 py-2">
                  Upload Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Resumes list */}
      {resumes.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-200 mb-4">My Resumes ({resumes.length})</h3>
          <div className="space-y-2">
            {resumes.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <FileText size={16} className="text-red-400 flex-shrink-0" />
                {editingId === r.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="input-field flex-1 py-1.5 text-sm"
                      autoFocus
                    />
                    <button onClick={() => handleRename(r.id)} className="text-emerald-400 hover:text-emerald-300 p-1">
                      <Check size={15} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-slate-300 p-1">
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-slate-300 truncate">{r.fileName}</span>
                    <span className="text-xs text-slate-500">{new Date(r.uploadedAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => { setEditingId(r.id); setEditName(r.fileName) }}
                      className="text-slate-500 hover:text-blue-400 p-1 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-200 mb-3 text-sm">Tips for best results</h3>
        <ul className="space-y-2 text-sm text-slate-400">
          {[
            'Use a text-based PDF (not a scanned image)',
            'Ensure your PDF is under 10MB',
            'Include all sections: Summary, Experience, Skills, Education',
            'Use standard fonts for better text extraction',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary-400 mt-0.5">·</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
