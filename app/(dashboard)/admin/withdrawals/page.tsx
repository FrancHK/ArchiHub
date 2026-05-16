'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import type { ArchiWithdrawal } from '@/lib/types/database'
import { ArrowDownToLine, Check, X } from 'lucide-react'

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<ArchiWithdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ArchiWithdrawal | null>(null)
  const [note, setNote] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetch('/api/admin/withdrawals')
      .then(r => r.json())
      .then(d => { setWithdrawals(d.withdrawals || []); setLoading(false) })
  }, [])

  const handleAction = async (status: 'approved' | 'rejected' | 'completed') => {
    if (!selected) return
    setProcessing(true)
    const res = await fetch('/api/admin/withdrawals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selected.id, status, admin_note: note }),
    })
    if (res.ok) {
      setWithdrawals(prev => prev.map(w => w.id === selected.id ? { ...w, status, admin_note: note } : w))
      setSelected(null)
      setNote('')
    }
    setProcessing(false)
  }

  const statusVariant: Record<string, 'gold' | 'success' | 'danger' | 'warning' | 'neutral'> = {
    pending: 'warning',
    approved: 'gold',
    completed: 'success',
    rejected: 'danger',
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-[#2E2E2E] border-t-[#D4AF37] animate-spin" /></div>

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Withdrawal Requests</h1>
        <p className="text-gray-400 mt-1">Review and process engineer withdrawal requests</p>
      </div>

      <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl overflow-hidden">
        {withdrawals.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2E2E2E]">
                <th className="text-left text-xs text-gray-500 px-5 py-3">Engineer</th>
                <th className="text-right text-xs text-gray-500 px-5 py-3">Amount</th>
                <th className="text-left text-xs text-gray-500 px-5 py-3 hidden md:table-cell">Method</th>
                <th className="text-center text-xs text-gray-500 px-5 py-3">Status</th>
                <th className="text-right text-xs text-gray-500 px-5 py-3">Requested</th>
                <th className="text-center text-xs text-gray-500 px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(w => {
                const eng = w.engineer as { profile?: { full_name?: string; avatar_url?: string } }
                return (
                  <tr key={w.id} className="border-b border-[#2E2E2E] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={eng?.profile?.avatar_url} name={eng?.profile?.full_name} size="sm" />
                        <span className="text-sm text-white">{eng?.profile?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-[#D4AF37] font-bold">{formatCurrency(w.amount)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-400 capitalize hidden md:table-cell">
                      {w.method.replace('_', ' ')}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge variant={statusVariant[w.status] || 'neutral'} size="sm">{w.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-gray-500">{formatDate(w.requested_at)}</td>
                    <td className="px-5 py-3.5 text-center">
                      {w.status === 'pending' && (
                        <button
                          onClick={() => setSelected(w)}
                          className="text-xs text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-lg hover:bg-[#D4AF37]/10 transition-colors"
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center">
            <ArrowDownToLine size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">No withdrawal requests</p>
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Review Withdrawal">
        {selected && (
          <div className="space-y-4">
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="text-[#D4AF37] font-bold">{formatCurrency(selected.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Method</span>
                <span className="text-white capitalize">{selected.method.replace('_', ' ')}</span>
              </div>
              {Object.entries(selected.account_details || {}).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-400 capitalize">{k.replace('_', ' ')}</span>
                  <span className="text-white">{v}</span>
                </div>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Admin Note (optional)</label>
              <textarea
                className="w-full bg-[#1E1E1E] border border-[#2E2E2E] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] resize-none text-sm"
                rows={2}
                placeholder="Add a note for the engineer..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="gold" size="md" loading={processing} onClick={() => handleAction('approved')} className="flex-1">
                <Check size={15} /> Approve
              </Button>
              <Button variant="ghost" size="md" loading={processing} onClick={() => handleAction('completed')} className="flex-1">
                Mark Completed
              </Button>
              <Button variant="danger" size="md" loading={processing} onClick={() => handleAction('rejected')}>
                <X size={15} /> Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
