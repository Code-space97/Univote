import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const statusConfig = {
  active:   { label: 'Active',    class: 'badge-active',   icon: '🟢' },
  upcoming: { label: 'Upcoming',  class: 'badge-upcoming', icon: '🔵' },
  closed:   { label: 'Closed',    class: 'badge-closed',   icon: '⚫' },
}

export default function VoterHome() {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/election')
      .then(res => setElections(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const hasVoted = (electionId) => user?.votedIn?.includes(electionId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 mb-8 text-white">
          <h1 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h1>
          <p className="text-primary-100 mt-1">Your voice matters. Cast your vote in active elections below.</p>
          <div className="mt-3 flex items-center gap-4 text-sm text-primary-200">
            <span>🎓 {user?.department || 'Department not set'}</span>
            <span>📋 ID: {user?.voterId}</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Elections</h2>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1,2,3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : elections.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🗳️</div>
            <p className="text-gray-500 text-lg">No elections available yet.</p>
            <p className="text-gray-400 text-sm mt-1">Check back later!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {elections.map(election => {
              const s = statusConfig[election.status] || statusConfig.closed
              const voted = hasVoted(election._id)
              return (
                <div key={election._id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight pr-2">{election.title}</h3>
                    <span className={s.class}>{s.icon} {s.label}</span>
                  </div>

                  {election.description && (
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{election.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-3">
                    {election.categories?.map(cat => (
                      <span key={cat} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{cat}</span>
                    ))}
                  </div>

                  <div className="text-xs text-gray-400 mb-4">
                    <span>📅 {new Date(election.startDate).toLocaleDateString()} → {new Date(election.endDate).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2">
                    {election.status === 'active' && !voted && (
                      <Link to={`/vote/${election._id}`} className="btn-primary text-sm flex-1 text-center py-2">
                        🗳️ Cast Vote
                      </Link>
                    )}
                    {voted && (
                      <span className="flex-1 text-center py-2 text-sm bg-green-50 text-green-700 rounded-lg border border-green-200 font-medium">
                        ✅ Voted
                      </span>
                    )}
                    {election.status === 'closed' && (
                      <Link to={`/results/${election._id}`} className="btn-secondary text-sm flex-1 text-center py-2">
                        📊 View Results
                      </Link>
                    )}
                    {election.status === 'upcoming' && (
                      <span className="flex-1 text-center py-2 text-sm bg-blue-50 text-blue-600 rounded-lg border border-blue-200 font-medium">
                        ⏳ Not started yet
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
