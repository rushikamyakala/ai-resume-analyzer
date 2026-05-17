import api from './axios'

// ── Auth ──────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
}

// ── Resumes ───────────────────────────────────────
export const resumeApi = {
  upload: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getAll:    ()   => api.get('/resumes'),
  getById:   (id) => api.get(`/resumes/${id}`),
  deleteById:(id) => api.delete(`/resumes/${id}`),
  rename: (id, fileName) => api.put(`/resumes/${id}/rename`, { fileName }),
}

// ── Job Descriptions ──────────────────────────────
export const jobApi = {
  create:    (data) => api.post('/job-descriptions', data),
  getAll:    ()     => api.get('/job-descriptions'),
  getById:   (id)   => api.get(`/job-descriptions/${id}`),
  deleteById:(id)   => api.delete(`/job-descriptions/${id}`),
}

// ── Analysis ──────────────────────────────────────
export const analysisApi = {
  analyze:      (data) => api.post('/analysis/analyze', data),
  getHistory:   ()     => api.get('/analysis/history'),
  getById:      (id)   => api.get(`/analysis/${id}`),
  getDashboard: ()     => api.get('/analysis/dashboard/stats'),
}

// ── Admin ─────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
}
