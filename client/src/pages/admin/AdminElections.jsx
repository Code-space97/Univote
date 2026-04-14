import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import Modal from '../../components/Modal'
import api from '../../utils/api'

const EMPTY = { title: '', description: '', categories: '', startDate: '', endDate: '' }

export default function AdminElections() {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/admin/elections').then(r => setElections(r.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const fmt = (d) => d ? new Date(d).toISOString().slice(0, 16) : ''

  const openAdd = () => { setForm(EMPTY); setEditId(null); setError(''); setModal('form') }
  const openEdit = (el) => {
    setForm({
      title: el.title, description: el.description || '',
      categories: el.categories?.join(', ') || '',
      startDate: fmt(el.startDate), endDate: fmt(el.endDate)
    })
    setEditId(el._id); setError(''); setModal('form')
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    const payload = {
      ...form,
      categories: form.categories.split(',').map(s => s.trim()).filter(Boolean)
    }
    try {
      if (editId) await api.put(`/admin/elections/${editId}`, payload)
      else await api.post('/admin/elections', payload)
      setModal(null); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this election and all related data?')) return
    await api.delete(`/admin/elections/${id}`)
    load()
  }

  const statusColor = { active: 'badge-active', upcoming: 'badge-upcoming', closed: 'badge-closed' }

  return (
    <AdminLayout title="Manage Elections">
      <div className="flex justify-end mb-4">
        <button onClick={openAdd} className="btn-primary">+ New Election</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}</div>
      ) : elections.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-5xl mb-3">🗳️</div>
          <p className="text-gray-400">No elections yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {elections.map(el => (
            <div key={el._id} className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900">{el.title}</h3>
                    <span className={statusColor[el.status]}>{el.status}</span>
                  </div>
                  {el.description && <p className="text-sm text-gray-500 mb-2">{el.description}</p>}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {el.categories?.map(c => (
                      <span key={c} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    📅 {new Date(el.startDate).toLocaleString()} → {new Date(el.endDate).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Link to={`/admin/elections/${el._id}/candidates`} className="btn-secondary text-xs py-1.5 px-3">
                    👤 Candidates
                  </Link>
                  <Link to={`/admin/elections/${el._id}/results`} className="btn-secondary text-xs py-1.5 px-3">
                    📊 Results
                  </Link>
                  <button onClick={() => openEdit(el)} className="btn-secondary text-xs py-1.5 px-3">✏️ Edit</button>
                  <button onClick={() => handleDelete(el._id)} className="btn-danger text-xs py-1.5 px-3">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editId ? 'Edit Election' : 'Create Election'}>
        {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2 text-sm mb-4">⚠️ {error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input className="input-field" placeholder="e.g. Student Council Election 2024" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field" rows={3} placeholder="Brief description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categories (comma-separated) *</label>
            <input className="input-field" placeholder="President, Vice President, Secretary" value={form.categories} onChange={e => setForm({...form, categories: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input type="datetime-local" className="input-field" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input type="datetime-local" className="input-field" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Election'}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
