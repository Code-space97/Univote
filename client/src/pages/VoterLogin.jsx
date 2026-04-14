import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function VoterLogin() {
  const [form, setForm] = useState({ voterId: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user, role } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    navigate(role === 'admin' ? '/admin' : '/home', { replace: true })
  }, [user, role, navigate])

  if (user) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/voter/login', form)
      login(data.token, data.user, 'voter')
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🗳️</div>
          <h1 className="text-3xl font-bold text-gray-900">UniVote</h1>
          <p className="text-gray-500 mt-1">University Online Voting System</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Voter Login</h2>
          <p className="text-sm text-gray-500 mb-6">Enter your unique Voter ID to cast your vote</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. V2024001"
                value={form.voterId}
                onChange={e => setForm({ ...form, voterId: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full py-2.5 mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in...
                </span>
              ) : '🔐 Sign In'}
            </button>
          </form>
        </div>

        {/* Admin link */}
        <div className="text-center mt-6">
          <Link to="/admin/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 transition">
            🛡️ Admin Login →
          </Link>
        </div>
      </div>
    </div>
  )
}
