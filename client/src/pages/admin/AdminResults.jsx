import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'
import AdminLayout from '../../components/AdminLayout'
import api from '../../utils/api'

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7']

export default function AdminResults() {
  const { id: electionId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)

  useEffect(() => {
    api.get(`/admin/elections/${electionId}/results`)
      .then(r => {
        setData(r.data)
        const cats = Object.keys(r.data.byCategory)
        if (cats.length > 0) setActiveCategory(cats[0])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [electionId])

  if (loading) return (
    <AdminLayout title="Election Results">
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    </AdminLayout>
  )

  if (!data) return (
    <AdminLayout title="Election Results">
      <div className="card text-center py-16 text-gray-400">Results not available.</div>
    </AdminLayout>
  )

  const { election, totalVotes, byCategory } = data
  const categories = Object.keys(byCategory)
  const currentCandidates = activeCategory ? byCategory[activeCategory] : []
  const categoryTotal = currentCandidates.reduce((s, c) => s + c.voteCount, 0)

  const barData = currentCandidates.map(c => ({ name: c.name, votes: c.voteCount }))
  const pieData = currentCandidates
    .filter(c => c.voteCount > 0)
    .map(c => ({ name: c.name, value: c.voteCount }))

  const statusColor = {
    active: 'badge-active',
    upcoming: 'badge-upcoming',
    closed: 'badge-closed'
  }

  return (
    <AdminLayout title="">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/admin/elections" className="hover:text-primary-600">Elections</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium truncate">{election.title}</span>
        <span>›</span>
        <span className="text-gray-900 font-medium">Results</span>
      </div>

      {/* Header */}
      <div className="card mb-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className={`${statusColor[election.status]} mb-2 inline-block`}>{election.status}</span>
            <h1 className="text-2xl font-bold">{election.title}</h1>
            {election.description && <p className="text-slate-300 text-sm mt-1">{election.description}</p>}
            <p className="text-slate-400 text-xs mt-2">
              📅 {new Date(election.startDate).toLocaleString()} → {new Date(election.endDate).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{totalVotes}</p>
            <p className="text-slate-400 text-sm">Total Ballots Cast</p>
          </div>
        </div>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {categories.map(cat => {
          const candidates = byCategory[cat]
          const total = candidates.reduce((s, c) => s + c.voteCount, 0)
          const winner = candidates[0]
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`card text-left transition-all hover:shadow-md ${
                activeCategory === cat
                  ? 'border-2 border-primary-500 bg-primary-50'
                  : 'border-2 border-transparent'
              }`}
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate">{cat}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{total} votes</p>
              {winner?.voteCount > 0 && (
                <p className="text-xs text-primary-600 mt-1 truncate">🏆 {winner.name}</p>
              )}
            </button>
          )
        })}
      </div>

      {/* Detailed View for selected category */}
      {activeCategory && (
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{activeCategory}</h2>
          <p className="text-sm text-gray-500 mb-6">{categoryTotal} votes cast in this category</p>

          {categoryTotal === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p>No votes cast in this category yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Bar Chart */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Vote Count</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                        {barData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              {pieData.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Vote Share</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend iconType="circle" iconSize={8} />
                        <Tooltip formatter={(v) => `${v} votes`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Candidate table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Rank', 'Candidate', 'Department', 'Year', 'Votes', 'Share'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentCandidates.map((c, i) => {
                  const share = categoryTotal > 0 ? ((c.voteCount / categoryTotal) * 100).toFixed(1) : '0.0'
                  return (
                    <tr key={c._id} className={i === 0 && c.voteCount > 0 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                      <td className="px-3 py-3 font-bold text-gray-400">
                        {i === 0 && c.voteCount > 0 ? '🏆' : `#${i + 1}`}
                      </td>
                      <td className="px-3 py-3 font-semibold text-gray-900">{c.name}</td>
                      <td className="px-3 py-3 text-gray-500">{c.department || '—'}</td>
                      <td className="px-3 py-3 text-gray-500">{c.year || '—'}</td>
                      <td className="px-3 py-3 font-bold text-primary-600">{c.voteCount}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-20">
                            <div
                              className="h-1.5 rounded-full bg-primary-500"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="text-gray-500 text-xs w-10">{share}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Link to="/admin/elections" className="btn-secondary text-sm">← Back to Elections</Link>
        <Link to={`/admin/elections/${electionId}/candidates`} className="btn-secondary text-sm">👤 Manage Candidates</Link>
      </div>
    </AdminLayout>
  )
}
