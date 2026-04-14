import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={role === 'admin' ? '/admin' : '/home'} className="flex items-center gap-2">
            <span className="text-2xl">🗳️</span>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">UniVote</span>
          </Link>

          <div className="flex items-center gap-3">
            {role === 'admin' && (
              <div className="hidden md:flex items-center gap-1 text-sm">
                <Link to="/admin" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition">Dashboard</Link>
                <Link to="/admin/voters" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition">Voters</Link>
                <Link to="/admin/elections" className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition">Elections</Link>
              </div>
            )}

            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{role === 'admin' ? '🛡️ Admin' : `🎓 ${user?.voterId || 'Voter'}`}</p>
              </div>
              <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-3">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
