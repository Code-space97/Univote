import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import Modal from '../../components/Modal'
import api from '../../utils/api'

const EMPTY = { name: '', category: '', department: '', year: '', manifesto: '' }

export default function AdminCandidates() {
  const { id: electionId } = useParams()
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadElection = () =>
    api.get(`/election/${electionId}`).then(r => setElection(r.data.election))

  const loadCandidates = () =>
    api.get(`/admin/elections/${electionId}/candidates`).then(r => setCandidates(r.data))

  useEffect(() => {
    Promise.all([loadElection(), loadCandidates()]).finally(() => setLoading(false))
  }, [electionId])

  const categories = election?.categories || []

  const openAdd = () => { setForm({ ...EMPTY, category: categories[0] || '' }); setEditId(null); setError(''); setModal(true) }
  const openEdit = (c) => {
    setForm({ name: c.name, category: c.category, department: c.department || '', year: c.year || '', manifesto: c.manifesto || '' })
    setEditId(c._id); setError(''); setModal(true)
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      if (editId) {
        await api.put(`/admin/candidates/${editId}`, form)
      } else {
        await api.post('/admin/candidates', { ...form, election: electionId })
      }
      setModal(false)
      loadCandidates()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (cid) => {
    if (!confirm('Delete this candidate?')) return
    await api.delete(`/admin/candidates/${cid}`)
    loadCandidates()
  }

  // Group by category
  const byCategory = {}
  for (const c of candidates) {
    if (!byCategory[c.category]) byCategory[c.category] = []
    byCategory[c.category].push(c)
  }

  return (
    <AdminLayout title="">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/admin/elections" className="hover:text-primary-600">Elections</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium truncate">{election?.title || 'Loading...'}</span>
        <span>›</span>
        <span className="text-gray-900 font-medium">Candidates</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          {election && (
            <p className="text-sm text-gray-500 mt-0.5">
              {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} across {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link to={`/admin/elections/${electionId}/results`} className="btn-secondary text-sm">📊 Results</Link>
          <button onClick={openAdd} className="btn-primary text-sm" disabled={categories.length === 0}>
            + Add Candidate
          </button>
        </div>
      </div>

      {categories.length === 0 && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-sm text-yellow-800">
          ⚠️ This election has no categories. <Link to="/admin/elections" className="underline font-medium">Edit the election</Link> to add categories first.
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}</div>
      ) : candidates.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">👤</div>
          <p className="text-gray-400">No candidates added yet.</p>
          <p className="text-gray-400 text-sm mt-1">Click "+ Add Candidate" to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map(cat => (
            <div key={cat} className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-bold">{cat}</span>
                  <span className="text-sm text-gray-400 font-normal">{(byCategory[cat] || []).length} candidate{(byCategory[cat] || []).length !== 1 ? 's' : ''}</span>
                </h2>
              </div>

              {(byCategory[cat] || []).length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No candidates in this category yet.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {(byCategory[cat] || []).map(c => (
                    <div key={c._id} className="flex items-center justify-between py-3 gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{c.name}</p>
                          <p className="text-xs text-gray-400">
                            {[c.department, c.year].filter(Boolean).join(' · ') || 'No details added'}
                          </p>
                          {c.manifesto && (
                            <p className="text-xs text-gray-400 italic truncate mt-0.5">"{c.manifesto}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center">
                          <p className="text-lg font-bold text-primary-600">{c.voteCount}</p>
                          <p className="text-xs text-gray-400">votes</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(c)} className="text-xs text-blue-600 hover:underline">Edit</button>
                          <button onClick={() => handleDelete(c._id)} className="text-xs text-red-500 hover:underline">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Candidate' : 'Add Candidate'}>
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2 text-sm mb-4">⚠️ {error}</div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              className="input-field"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Select category...</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              className="input-field"
              placeholder="Candidate's full name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                className="input-field"
                placeholder="e.g. Computer Science"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                className="input-field"
                value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
              >
                <option value="">Select...</option>
                {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'].map(y => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manifesto / Tagline</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Brief manifesto or campaign slogan..."
              value={form.manifesto}
              onChange={e => setForm({ ...form, manifesto: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1" disabled={saving || !form.name || !form.category}>
              {saving ? 'Saving...' : editId ? 'Save Changes' : 'Add Candidate'}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
