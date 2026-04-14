import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../utils/api'

export default function VotePage() {
  const { electionId } = useParams()
  const navigate = useNavigate()
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [hasVoted, setHasVoted] = useState(false)
  const [selections, setSelections] = useState({}) // { category: candidateId }
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState('ballot') // 'ballot' | 'preview' | 'success'
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/election/${electionId}`)
      .then(res => {
        setElection(res.data.election)
        setCandidates(res.data.candidates)
        setHasVoted(res.data.hasVoted)
        if (res.data.hasVoted || res.data.election.status !== 'active') {
          navigate('/home')
        }
      })
      .catch(() => navigate('/home'))
      .finally(() => setLoading(false))
  }, [electionId])

  const categories = [...new Set(candidates.map(c => c.category))]

  const allSelected = categories.every(cat => selections[cat])

  const handleSelect = (category, candidateId) => {
    setSelections(prev => ({ ...prev, [category]: candidateId }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const votes = Object.entries(selections).map(([category, candidateId]) => ({ category, candidateId }))
      await api.post(`/election/${electionId}/vote`, { votes })
      setStep('success')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit vote.')
      setStep('ballot')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )

  if (step === 'success') return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="card">
          <div className="text-7xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vote Submitted!</h2>
          <p className="text-gray-500 mb-6">Your vote has been recorded securely. Thank you for participating!</p>
          <button onClick={() => navigate('/home')} className="btn-primary px-8 py-2.5">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Election Header */}
        <div className="card mb-6 bg-gradient-to-r from-primary-50 to-green-50 border-primary-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-active">🟢 Active</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-2">{election?.title}</h1>
          {election?.description && <p className="text-gray-600 text-sm mt-1">{election.description}</p>}
          <p className="text-xs text-gray-400 mt-2">Select one candidate per category</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">⚠️ {error}</div>
        )}

        {step === 'ballot' && (
          <>
            {categories.map(category => (
              <div key={category} className="card mb-4">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-primary-100 text-primary-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {categories.indexOf(category) + 1}
                  </span>
                  {category}
                </h3>
                <div className="space-y-2">
                  {candidates.filter(c => c.category === category).map(candidate => (
                    <label
                      key={candidate._id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selections[category] === candidate._id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={category}
                        value={candidate._id}
                        checked={selections[category] === candidate._id}
                        onChange={() => handleSelect(category, candidate._id)}
                        className="text-primary-600 w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{candidate.name}</p>
                        <p className="text-xs text-gray-500">
                          {[candidate.department, candidate.year].filter(Boolean).join(' · ')}
                        </p>
                        {candidate.manifesto && (
                          <p className="text-xs text-gray-400 mt-1 italic">"{candidate.manifesto}"</p>
                        )}
                      </div>
                      {selections[category] === candidate._id && (
                        <span className="text-primary-600 font-bold">✓</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-500">
                {Object.keys(selections).length} of {categories.length} categories selected
              </p>
              <button
                className="btn-primary px-6 py-2.5 disabled:opacity-40"
                onClick={() => setStep('preview')}
                disabled={!allSelected}
              >
                Review Ballot →
              </button>
            </div>
          </>
        )}

        {step === 'preview' && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Review Your Ballot</h2>
            <p className="text-gray-500 text-sm mb-6">Please confirm your selections before submitting.</p>

            <div className="space-y-3 mb-6">
              {categories.map(cat => {
                const chosen = candidates.find(c => c._id === selections[cat])
                return (
                  <div key={cat} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500">{cat}</p>
                      <p className="font-semibold text-gray-900">{chosen?.name}</p>
                    </div>
                    <span className="text-primary-600">✓</span>
                  </div>
                )
              })}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-sm text-yellow-800">
              ⚠️ <strong>Warning:</strong> Your vote cannot be changed after submission.
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('ballot')} className="btn-secondary flex-1 py-2.5">
                ← Edit Ballot
              </button>
              <button onClick={handleSubmit} className="btn-primary flex-1 py-2.5" disabled={submitting}>
                {submitting ? 'Submitting...' : '🗳️ Submit Vote'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
