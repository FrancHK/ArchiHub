'use client'

import { useEffect, useState } from 'react'
import { Wallet, DollarSign, Clock, ArrowDownToLine, Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import StatsCard from '@/components/dashboard/StatsCard'
import { formatCurrency, formatDate, WITHDRAWAL_METHODS } from '@/lib/utils'
import type { ArchiWithdrawal, ArchiWallet } from '@/lib/types/database'

export default function WalletPage() {
  const [walletData, setWalletData] = useState<{ wallet: ArchiWallet; recent_sales: unknown[] } | null>(null)
  const [withdrawals, setWithdrawals] = useState<ArchiWithdrawal[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ amount: '', method: 'mpesa', phone: '', bank_name: '', account_number: '' })

  useEffect(() => {
    Promise.all([
      fetch('/api/wallet').then(r => r.json()),
      fetch('/api/wallet/withdraw').then(r => r.json()),
    ]).then(([walletRes, withdrawRes]) => {
      setWalletData(walletRes)
      setWithdrawals(withdrawRes.withdrawals || [])
    })
  }, [])

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const accountDetails = form.method === 'mpesa' || form.method === 'airtel_money'
        ? { phone: form.phone }
        : { bank_name: form.bank_name, account_number: form.account_number }

      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: form.amount, method: form.method, account_details: accountDetails }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
      const updated = await fetch('/api/wallet').then(r => r.json())
      setWalletData(updated)
      setWithdrawals(prev => [data.withdrawal, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  const wallet = walletData?.wallet

  const statusVariant: Record<string, 'gold' | 'success' | 'danger' | 'warning' | 'neutral'> = {
    pending: 'warning',
    approved: 'gold',
    completed: 'success',
    rejected: 'danger',
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Wallet</h1>
        <p className="text-gray-400 mt-1">Manage your earnings and withdrawals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Available Balance" value={formatCurrency(wallet?.balance || 0)} icon={<Wallet size={18} />} variant="gold" />
        <StatsCard title="Pending Withdrawal" value={formatCurrency(wallet?.pending_balance || 0)} icon={<Clock size={18} />} />
        <StatsCard title="Total Earned" value={formatCurrency(wallet?.total_earned || 0)} icon={<DollarSign size={18} />} />
      </div>

      {/* Withdraw button */}
      <div className="flex justify-end">
        <Button
          variant="gold"
          onClick={() => setModalOpen(true)}
          disabled={!wallet || wallet.balance < 10}
        >
          <ArrowDownToLine size={16} />
          Request Withdrawal
        </Button>
      </div>

      {/* Withdrawal history */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Withdrawal History</h2>
        {withdrawals.length > 0 ? (
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2E2E2E]">
                  <th className="text-left text-xs text-gray-500 px-5 py-3">Amount</th>
                  <th className="text-left text-xs text-gray-500 px-5 py-3">Method</th>
                  <th className="text-left text-xs text-gray-500 px-5 py-3">Status</th>
                  <th className="text-right text-xs text-gray-500 px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w.id} className="border-b border-[#2E2E2E] last:border-0">
                    <td className="px-5 py-3.5 text-[#D4AF37] font-semibold">{formatCurrency(w.amount)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-400 capitalize">{w.method.replace('_', ' ')}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={statusVariant[w.status] || 'neutral'} size="sm">{w.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-gray-500">{formatDate(w.requested_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-10 text-center">
            <ArrowDownToLine size={36} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">No withdrawals yet</p>
          </div>
        )}
      </div>

      {/* Withdrawal modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setSuccess(false) }} title="Request Withdrawal">
        {success ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-[#D4AF37]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Withdrawal Requested</h3>
            <p className="text-gray-400 text-sm">Your request is under review. Funds will be sent within 1-3 business days.</p>
            <Button variant="gold" className="mt-5" onClick={() => { setModalOpen(false); setSuccess(false) }}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg p-3">
              <p className="text-sm text-gray-400">Available: <span className="text-[#D4AF37] font-bold">{formatCurrency(wallet?.balance || 0)}</span></p>
            </div>
            <Input
              label="Amount (USD)"
              type="number"
              placeholder="Minimum $10"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              min="10"
              max={wallet?.balance}
              required
            />
            <Select
              label="Withdrawal Method"
              value={form.method}
              onChange={e => setForm({ ...form, method: e.target.value })}
              options={WITHDRAWAL_METHODS.map(m => ({ value: m, label: m.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }))}
            />
            {(form.method === 'mpesa' || form.method === 'airtel_money') && (
              <Input
                label="Phone Number"
                placeholder="+254 7XX XXX XXX"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
              />
            )}
            {(form.method === 'bank_transfer') && (
              <>
                <Input label="Bank Name" value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} required />
                <Input label="Account Number" value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} required />
              </>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" variant="gold" size="lg" fullWidth loading={loading}>Submit Request</Button>
          </form>
        )}
      </Modal>
    </div>
  )
}
