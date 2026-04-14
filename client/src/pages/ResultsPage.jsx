import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Navbar from '../components/Navbar'
import api from '../utils/api'

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0']

export default function ResultsPage() {
  const { electionId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/election/${electionId}/results`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [electionId])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )

  if (!data) return <div className="text-center py-20 text-gray-500">Results not available.</div>

  const { election, totalVotes, byCategory } = data

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="card mb-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0">
          <div className="flex items-start justify-between">
            <div>
              <span className="badge-closed mb-2 inline-block">⚫ {election.status}</span>
              <h1 className="text-2xl font-bold mt-1">{election.title}</h1>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{totalVotes}</p>
              <p className="text-slate-400 text-sm">Total Votes</p>
            </div>
          </div>
        </div>

        {Object.entries(byCategory).map(([category, candidates]) => {
          const maxVotes = Math.max(...candidates.map(c => c.voteCount), 1)
          const winner = candidates[0]
          const chartData = candidates.map(c => ({ name: c.name, votes: c.voteCount }))

          return (
            <div key={category} className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">{category}</h2>
                <span className="text-sm text-gray-500">{candidates.reduce((s, c) => s + c.voteCount, 0)} votes</span>
              </div>

              {/* Winner banner */}
              {winner.voteCount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="font-semibold text-yellow-900">{winner.name}</p>
                    <p className="text-sm text-yellow-700">{winner.voteCount} votes · Winner</p>
                  </div>
                </div>
              )}

              {/* Bar chart */}
              <div className="mb-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Candidate list */}
              <div className="space-y-2">
                {candidates.map((c, i) => {
                  const pct = totalVotes > 0 ? Math.round((c.voteCount / Math.max(candidates.reduce((s,x) => s + x.voteCount, 0), 1)) * 100) : 0
                  return (
                    <div key={c._id} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400 w-4">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-800">{c.name}</span>
                          <span className="text-gray-500">{c.voteCount} ({pct}%)</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-primary-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div className="text-center mt-4">
          <Link to="/home" className="btn-secondary px-6 py-2">← Back to Home</Link>
        </div>
      </main>
    </div>
  )
}
