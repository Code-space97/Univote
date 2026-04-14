import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import api from '../../utils/api'

function StatCard({ label, value, icon, color }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? '—'}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/elections')])
      .then(([s, e]) => { setStats(s.data); setElections(e.data.slice(0, 5)) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Voters" value={stats?.totalVoters} icon="👥" color="text-blue-600" />
        <StatCard label="Elections" value={stats?.totalElections} icon="🗳️" color="text-purple-600" />
        <StatCard label="Active Now" value={stats?.activeElections} icon="🟢" color="text-green-600" />
        <StatCard label="Votes Cast" value={stats?.totalVotes} icon="✅" color="text-primary-600" />
      </div>

      {/* Quick Actions */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/voters" className="btn-primary text-sm">+ Add Voter</Link>
          <Link to="/admin/elections" className="btn-primary text-sm">+ New Election</Link>
        </div>
      </div>

      {/* Recent Elections */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Elections</h2>
          <Link to="/admin/elections" className="text-sm text-primary-600 hover:underline">View all →</Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : elections.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No elections yet. Create one!</p>
        ) : (
          <div className="space-y-2">
            {elections.map(el => (
              <div key={el._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{el.title}</p>
                  <p className="text-xs text-gray-400">{new Date(el.startDate).toLocaleDateString()} → {new Date(el.endDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    el.status === 'active' ? 'bg-green-100 text-green-700' :
                    el.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>{el.status}</span>
                  <Link to={`/admin/elections/${el._id}/results`} className="text-xs text-primary-600 hover:underline">Results</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
