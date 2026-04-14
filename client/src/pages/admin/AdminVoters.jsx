import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import Modal from '../../components/Modal'
import api from '../../utils/api'

const EMPTY_FORM = { voterId: '', name: '', email: '', password: '', department: '', year: '1st Year' }
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate']

export default function AdminVoters() {
  const [voters, setVoters] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    api.get('/admin/voters').then(r => setVoters(r.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setError(''); setModal('add') }
  const openEdit = (v) => {
    setForm({ voterId: v.voterId, name: v.name, email: v.email, password: '', department: v.department || '', year: v.year || '1st Year' })
    setEditId(v._id); setError(''); setModal('edit')
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      if (modal === 'add') {
        await api.post('/admin/voters', form)
      } else {
        const { password, voterId, ...rest } = form
        await api.put(`/admin/voters/${editId}`, rest)
      }
      setModal(null); load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this voter? This cannot be undone.')) return
    await api.delete(`/admin/voters/${id}`)
    load()
  }

  const filtered = voters.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.voterId.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Manage Voters">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          className="input-field flex-1"
          placeholder="🔍 Search by name, ID or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button onClick={openAdd} className="btn-primary whitespace-nowrap">+ Add Voter</button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Voter ID', 'Name', 'Email', 'Department', 'Year', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No voters found.</td></tr>
              ) : filtered.map(v => (
                <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-primary-700 font-medium">{v.voterId}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                  <td className="px-4 py-3 text-gray-500">{v.email}</td>
                  <td className="px-4 py-3 text-gray-500">{v.department || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{v.year}</td>
                  <td className="px-4 py-3">
                    <span className={v.isActive ? 'badge-active' : 'badge-closed'}>
                      {v.isActive ? '✅ Active' : '🚫 Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(v)} className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(v._id)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
          {filtered.length} voter{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add New Voter' : 'Edit Voter'}>
        {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2 text-sm mb-4">⚠️ {error}</div>}
        <div className="space-y-4">
          {modal === 'add' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID *</label>
              <input className="input-field" placeholder="e.g. V2024001" value={form.voterId} onChange={e => setForm({...form, voterId: e.target.value})} required />
            </div>
          )}
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Student Name' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'student@university.edu' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label} *</label>
              <input type={f.type} className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} required />
            </div>
          ))}
          {modal === 'add' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input type="password" className="input-field" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input className="input-field" placeholder="e.g. Computer Science" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select className="input-field" value={form.year} onChange={e => setForm({...form, year: e.target.value})}>
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving...' : modal === 'add' ? 'Add Voter' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
