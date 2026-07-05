import React, { useState, useEffect } from 'react'
import { SidebarItem, AdminCard, StatusBadge } from '../components/admin/AdminUI'
import { useStore } from '../store/useStore'

interface Props {
  onLogout: () => void
}

const API = '/api/admin'

const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const { bookings, fields, updateBookingStatus, setFields, addField, updateField, setBookings } = useStore()
  const [activeTab, setActiveTab] = useState<'bookings' | 'venues' | 'settings'>('bookings')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = localStorage.getItem('admin_token')

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, fieldsRes] = await Promise.all([
          fetch(`${API}/bookings`, { headers }),
          fetch(`${API}/fields`, { headers })
        ])

        if (bookingsRes.ok) {
          const data = await bookingsRes.json()
          setBookings(data.map((b: any) => ({
            id: b.id,
            customer: b.customer,
            whatsapp: b.whatsapp,
            fieldId: b.fieldId,
            fieldName: b.field?.name || '',
            slotId: b.slotTime,
            slotTime: b.slotTime,
            status: b.status,
            date: b.date?.split('T')[0] || ''
          })))
        }
        if (fieldsRes.ok) {
          const data = await fieldsRes.json()
          setFields(data.map((f: any) => ({
            id: f.id,
            name: f.name,
            locationId: f.locationId,
            locationName: f.location?.name || '',
            image: f.image || '',
            description: f.description || '',
            pricePerHour: f.pricePerHour,
            type: f.type as 'Synthetic' | 'Vinyl' | 'Parquet'
          })))
        }
      } catch (err) {
        setError('Failed to fetch data from server. Showing local data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    updateBookingStatus(id, status)
    // Only call backend for DB bookings (real UUIDs), skip local ones (BK-xxxx)
    if (!id.startsWith('BK-')) {
      fetch(`${API}/bookings/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      }).catch(() => {})
    }
  }

  const handleAddField = async () => {
    if (!fieldName || !fieldPrice || !fieldLocation) return
    try {
      const res = await fetch(`${API}/fields`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: fieldName,
          type: fieldType,
          pricePerHour: parseInt(fieldPrice),
          locationName: fieldLocation,
          image: fieldImage,
          description: fieldDescription
        })
      })
      if (res.ok) {
        const data = await res.json()
        addField({
          id: data.id,
          name: data.name,
          type: data.type,
          pricePerHour: data.pricePerHour,
          locationId: data.locationId,
          locationName: data.location?.name || fieldLocation,
          image: data.image || '',
          description: data.description || ''
        })
      } else {
        setError('Failed to add field')
      }
    } catch {
      setError('Failed to add field')
    }
    setFieldName('')
    setFieldPrice('')
    setFieldLocation('')
    setFieldImage('')
    setFieldDescription('')
  }

  const handleEditField = async () => {
    if (!editingField || !fieldName || !fieldPrice || !fieldLocation) return
    try {
      const res = await fetch(`${API}/fields/${editingField}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          name: fieldName,
          type: fieldType,
          pricePerHour: parseInt(fieldPrice),
          locationName: fieldLocation,
          image: fieldImage,
          description: fieldDescription
        })
      })
      if (res.ok) {
        const data = await res.json()
        updateField(editingField, {
          name: data.name,
          type: data.type,
          pricePerHour: data.pricePerHour,
          locationId: data.locationId,
          locationName: data.location?.name || fieldLocation,
          image: data.image || '',
          description: data.description || ''
        })
      } else {
        setError('Failed to update field')
      }
    } catch {
      setError('Failed to update field')
    }
    setEditingField(null)
    setFieldName('')
    setFieldPrice('')
    setFieldLocation('')
    setFieldImage('')
    setFieldDescription('')
  }

  const startEditField = (f: any) => {
    setEditingField(f.id)
    setFieldName(f.name)
    setFieldType(f.type)
    setFieldPrice(String(f.pricePerHour))
    setFieldLocation(f.locationName)
    setFieldImage(f.image || '')
    setFieldDescription(f.description || '')
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    onLogout()
  }

  const [fieldName, setFieldName] = useState('')
  const [fieldType, setFieldType] = useState<'Synthetic' | 'Vinyl' | 'Parquet'>('Synthetic')
  const [fieldPrice, setFieldPrice] = useState('')
  const [fieldLocation, setFieldLocation] = useState('')
  const [fieldImage, setFieldImage] = useState('')
  const [fieldDescription, setFieldDescription] = useState('')
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const typeOptions = ['Synthetic', 'Vinyl', 'Parquet'] as const

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length
  const approvedCount = bookings.filter(b => b.status === 'APPROVED').length

  return (
    <div className="flex min-h-screen bg-canvas text-primary">
      <aside className="w-64 border-r border-hairline flex flex-col">
        <div className="p-6 border-b border-hairline">
          <div className="font-display text-sm uppercase tracking-wordmark">ADMIN PANEL</div>
        </div>
        <div className="flex-1 py-6">
          <SidebarItem label="Bookings" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
          <SidebarItem label="Venues" active={activeTab === 'venues'} onClick={() => setActiveTab('venues')} />
          <SidebarItem label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
        <div className="p-6 border-t border-hairline">
          <div className="font-mono text-[10px] uppercase text-muted">Admin v1.0.0</div>
        </div>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="font-display text-3xl uppercase tracking-display">
            {activeTab === 'bookings' ? 'Booking Management' : activeTab === 'venues' ? 'Venue Management' : 'System Settings'}
          </h1>
          <button onClick={handleLogout} className="font-mono text-[12px] uppercase text-muted hover:text-link transition-colors">Sign Out</button>
        </header>

        {loading && (
          <div className="text-center py-12">
            <div className="font-mono text-[11px] uppercase text-muted">Loading...</div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 border border-warning/50 bg-surface-card">
            <div className="font-mono text-[11px] uppercase text-warning">{error}</div>
          </div>
        )}

        {!loading && activeTab === 'bookings' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AdminCard title="Pending">
                <div className="text-4xl font-display tracking-display">{pendingCount}</div>
                <div className="text-[10px] font-mono uppercase text-muted mt-2">Requires Action</div>
              </AdminCard>
              <AdminCard title="Approved">
                <div className="text-4xl font-display tracking-display">{approvedCount}</div>
                <div className="text-[10px] font-mono uppercase text-muted mt-2">Confirmed Slots</div>
              </AdminCard>
              <AdminCard title="Revenue">
                <div className="text-4xl font-display tracking-display">Rp {bookings.reduce((sum, b) => {
                  if (b.status === 'APPROVED') {
                    const field = fields.find(f => f.id === b.fieldId)
                    return sum + (field?.pricePerHour || 150000)
                  }
                  return sum
                }, 0).toLocaleString()}</div>
                <div className="text-[10px] font-mono uppercase text-muted mt-2">Est. Total Value</div>
              </AdminCard>
            </div>

            <AdminCard title="Recent Requests">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="border-b border-hairline">
                    <tr>
                      <th className="py-4 font-mono text-[11px] uppercase text-muted">Booking ID</th>
                      <th className="py-4 font-mono text-[11px] uppercase text-muted">Customer</th>
                      <th className="py-4 font-mono text-[11px] uppercase text-muted">Field / Slot</th>
                      <th className="py-4 font-mono text-[11px] uppercase text-muted">Status</th>
                      <th className="py-4 font-mono text-[11px] uppercase text-muted text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center font-mono text-xs text-muted italic">
                          No bookings found.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={b.id} className="border-b border-hairline hover:bg-surface-soft transition-colors">
                          <td className="py-4 font-mono text-xs">{b.id.slice(0, 8)}</td>
                          <td className="py-4">
                            <div className="text-sm">{b.customer}</div>
                            <div className="text-[10px] font-mono text-muted">{b.whatsapp}</div>
                          </td>
                          <td className="py-4">
                            <div className="text-sm">{b.fieldName || '—'}</div>
                            <div className="text-[10px] font-mono text-muted">{b.slotTime}</div>
                          </td>
                          <td className="py-4">
                            <StatusBadge status={b.status} />
                          </td>
                          <td className="py-4 text-right">
                            {b.status === 'PENDING' && (
                              <div className="flex justify-end gap-2">
                                <button onClick={() => handleStatus(b.id, 'APPROVED')} className="px-3 py-1 border border-success text-success font-mono text-[10px] uppercase hover:bg-success hover:text-black transition-all">Approve</button>
                                <button onClick={() => handleStatus(b.id, 'REJECTED')} className="px-3 py-1 border border-red-500 text-red-500 font-mono text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all">Reject</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </AdminCard>
          </div>
        )}

        {!loading && activeTab === 'venues' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AdminCard title={editingField ? "Edit Field" : "Quick Add Field"}>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); editingField ? handleEditField() : handleAddField() }}>
                <div className="relative">
                  <label className="font-mono text-[11px] uppercase text-muted absolute -top-4 left-0">Field Name</label>
                  <input value={fieldName} onChange={e => setFieldName(e.target.value)} className="w-full bg-transparent border-b border-hairline-strong py-3 text-primary outline-none focus:border-primary" />
                </div>
                <div className="relative">
                  <label className="font-mono text-[11px] uppercase text-muted absolute -top-4 left-0">Surface Type</label>
                  <button type="button" onClick={() => setShowTypeDropdown(!showTypeDropdown)} onBlur={() => setTimeout(() => setShowTypeDropdown(false), 150)} className="w-full bg-transparent border-b border-hairline-strong py-3 flex items-center justify-between text-primary outline-none focus:border-primary cursor-pointer">
                    <span className="font-mono text-[11px] uppercase tracking-caption">{fieldType}</span>
                    <span className={`font-mono text-[10px] text-muted transition-transform duration-200 ${showTypeDropdown ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                  {showTypeDropdown && (
                    <div className="absolute top-full left-0 right-0 z-20 mt-1 border border-hairline bg-surface-card">
                      {typeOptions.map((opt) => (
                        <div key={opt} onMouseDown={() => { setFieldType(opt); setShowTypeDropdown(false) }} className={`px-4 py-3 font-mono text-[11px] uppercase tracking-caption cursor-pointer transition-colors ${fieldType === opt ? 'bg-primary text-canvas' : 'text-primary hover:bg-surface-elevated'}`}>{opt}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <label className="font-mono text-[11px] uppercase text-muted absolute -top-4 left-0">Price per Hour (Rp)</label>
                  <input value={fieldPrice} onChange={e => setFieldPrice(e.target.value)} type="number" className="w-full bg-transparent border-b border-hairline-strong py-3 text-primary outline-none focus:border-primary" />
                </div>
                <div className="relative">
                  <label className="font-mono text-[11px] uppercase text-muted absolute -top-4 left-0">Location</label>
                  <input value={fieldLocation} onChange={e => setFieldLocation(e.target.value)} placeholder="e.g. Jakarta Branch" className="w-full bg-transparent border-b border-hairline-strong py-3 text-primary outline-none focus:border-primary placeholder:text-muted-soft" />
                </div>
                <div className="relative">
                  <label className="font-mono text-[11px] uppercase text-muted absolute -top-4 left-0">Image URL</label>
                  <input value={fieldImage} onChange={e => setFieldImage(e.target.value)} placeholder="https://..." className="w-full bg-transparent border-b border-hairline-strong py-3 text-primary outline-none focus:border-primary placeholder:text-muted-soft" />
                </div>
                {fieldImage && (
                  <div className="border border-hairline p-2">
                    <img src={fieldImage} alt="Preview" className="w-full h-32 object-cover" />
                  </div>
                )}
                <div className="relative">
                  <label className="font-mono text-[11px] uppercase text-muted absolute -top-4 left-0">Description</label>
                  <textarea value={fieldDescription} onChange={e => setFieldDescription(e.target.value)} rows={2} className="w-full bg-transparent border-b border-hairline-strong py-3 text-primary outline-none focus:border-primary resize-none" />
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="flex-1 py-3 border border-primary font-mono text-[12px] uppercase tracking-button hover:bg-primary hover:text-black transition-all">
                    {editingField ? 'Save Changes' : 'Add Field'}
                  </button>
                  {editingField && (
                    <button type="button" onClick={() => { setEditingField(null); setFieldName(''); setFieldPrice(''); setFieldLocation(''); setFieldImage(''); setFieldDescription('') }} className="px-4 py-3 border border-hairline font-mono text-[12px] uppercase text-muted hover:border-primary transition-all">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </AdminCard>
            <AdminCard title="Live Status">
              <div className="space-y-4">
                {fields.length === 0 ? (
                  <div className="font-mono text-[11px] text-muted italic text-center py-4">No fields yet</div>
                ) : (
                  fields.map(f => (
                    <div key={f.id} className="p-3 border border-hairline">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          {f.image ? (
                            <img src={f.image} alt={f.name} className="w-16 h-12 object-cover border border-hairline" />
                          ) : (
                            <div className="w-16 h-12 bg-surface-card border border-hairline flex items-center justify-center">
                              <span className="font-mono text-[8px] text-muted">No Img</span>
                            </div>
                          )}
                          <div>
                            <span className="font-mono text-xs uppercase">{f.name}</span>
                            <div className="text-[10px] font-mono text-muted">{f.type} — Rp {f.pricePerHour.toLocaleString()}/hr</div>
                            <div className="text-[10px] font-mono text-muted">{f.locationName}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-success text-[10px] font-mono uppercase">Active</span>
                          <button onClick={() => startEditField(f)} className="text-link text-[10px] font-mono uppercase hover:underline">Edit</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </AdminCard>
          </div>
        )}

        {activeTab === 'settings' && (
          <AdminCard title="Admin Configuration">
            <div className="space-y-6 max-w-lg">
              <div className="flex justify-between items-center border-b border-hairline pb-4">
                <div>
                  <div className="font-display text-sm uppercase">Payment Gateway</div>
                  <div className="text-[10px] font-mono text-muted">Manual WhatsApp Verification</div>
                </div>
                <button className="text-link text-xs font-mono uppercase">Change</button>
              </div>
              <div className="flex justify-between items-center border-b border-hairline pb-4">
                <div>
                  <div className="font-display text-sm uppercase">Primary Contact</div>
                  <div className="text-[10px] font-mono text-muted">+62 812 3456 789</div>
                </div>
                <button className="text-link text-xs font-mono uppercase">Edit</button>
              </div>
            </div>
          </AdminCard>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
