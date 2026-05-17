import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import JobDescriptionPage from './pages/JobDescriptionPage'
import AnalyzePage from './pages/AnalyzePage'
import HistoryPage from './pages/HistoryPage'
import AnalysisDetailPage from './pages/AnalysisDetailPage'
import AdminPage from './pages/AdminPage'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
     <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard"           element={<DashboardPage />} />
            <Route path="/upload"              element={<UploadPage />} />
            <Route path="/job-descriptions"    element={<JobDescriptionPage />} />
            <Route path="/analyze"             element={<AnalyzePage />} />
            <Route path="/history"             element={<HistoryPage />} />
            <Route path="/history/:id"         element={<AnalysisDetailPage />} />
            <Route path="/admin"               element={<AdminRoute><AdminPage /></AdminRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  )
}
