import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

export default function AdminSetup() {
  const [form, setForm] = useState({ setupKey: '', username: '', password: '', name: '', email: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setMessage('')
    setLoading(true)
    try {
      await api.post('/auth/admin/setup', form)
      setMessage('Admin account created! Redirecting to login...')
      setTimeout(() => navigate('/admin/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Setup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚙️</div>
          <h1 className="text-2xl font-bold text-white">Admin Setup</h1>
          <p className="text-slate-400 mt-1 text-sm">Create the first administrator account</p>
        </div>

        <div className="bg-white/10 border border-white/20 rounded-xl p-8">
          {error && <div className="bg-red-500/20 border border-red-500/30 text-red-200 rounded-lg px-4 py-3 mb-4 text-sm">⚠️ {error}</div>}
          {message && <div className="bg-green-500/20 border border-green-500/30 text-green-200 rounded-lg px-4 py-3 mb-4 text-sm">✅ {message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'setupKey', label: 'Setup Key', type: 'password', placeholder: 'Secret setup key from .env' },
              { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Administrator' },
              { key: 'username', label: 'Username', type: 'text', placeholder: 'admin' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'admin@university.edu' },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-300 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  required
                />
              </div>
            ))}
            <button type="submit" className="w-full btn-primary py-2.5" disabled={loading}>
              {loading ? 'Creating...' : 'Create Admin Account'}
            </button>
          </form>
        </div>

        <div className="text-center mt-4">
          <Link to="/admin/login" className="text-sm text-slate-400 hover:text-white transition">← Back to Admin Login</Link>
        </div>
      </div>
    </div>
  )
}
