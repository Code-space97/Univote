import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import VoterLogin from './pages/VoterLogin'
import AdminLogin from './pages/AdminLogin'
import VoterHome from './pages/VoterHome'
import VotePage from './pages/VotePage'
import ResultsPage from './pages/ResultsPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminVoters from './pages/admin/AdminVoters'
import AdminElections from './pages/admin/AdminElections'
import AdminCandidates from './pages/admin/AdminCandidates'
import AdminResults from './pages/admin/AdminResults'
import AdminSetup from './pages/AdminSetup'

function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<VoterLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/setup" element={<AdminSetup />} />

          {/* Voter Routes */}
          <Route path="/home" element={
            <ProtectedRoute requiredRole="voter"><VoterHome /></ProtectedRoute>
          } />
          <Route path="/vote/:electionId" element={
            <ProtectedRoute requiredRole="voter"><VotePage /></ProtectedRoute>
          } />
          <Route path="/results/:electionId" element={
            <ProtectedRoute><ResultsPage /></ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/voters" element={
            <ProtectedRoute requiredRole="admin"><AdminVoters /></ProtectedRoute>
          } />
          <Route path="/admin/elections" element={
            <ProtectedRoute requiredRole="admin"><AdminElections /></ProtectedRoute>
          } />
          <Route path="/admin/elections/:id/candidates" element={
            <ProtectedRoute requiredRole="admin"><AdminCandidates /></ProtectedRoute>
          } />
          <Route path="/admin/elections/:id/results" element={
            <ProtectedRoute requiredRole="admin"><AdminResults /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
