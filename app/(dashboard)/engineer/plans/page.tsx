'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { ArchiPlan } from '@/lib/types/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { FileText, Edit, Trash2, Eye, EyeOff, Plus } from 'lucide-react'

export default function EngineerPlansPage() {
  const [plans, setPlans] = useState<ArchiPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('archi_engineer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
        .then(({ data: ep }) => {
          if (!ep) return
          supabase
            .from('archi_plans')
            .select('*')
            .eq('engineer_id', ep.id)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
              setPlans(data || [])
              setLoading(false)
            })
        })
    })
  }, [])

  const togglePublish = async (plan: ArchiPlan) => {
    const res = await fetch(`/api/plans/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !plan.is_published }),
    })
    if (res.ok) {
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_published: !p.is_published } : p))
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/plans/${deleteId}`, { method: 'DELETE' })
    setPlans(prev => prev.filter(p => p.id !== deleteId))
    setDeleteId(null)
    setDeleting(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="h-8 w-8 rounded-full border-2 border-[#2E2E2E] border-t-[#D4AF37] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-7 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>My Plans</h1>
          <p className="text-gray-400 mt-1">Manage your uploaded architectural plans</p>
        </div>
        <Link href="/engineer/plans/upload">
          <Button variant="gold"><Plus size={16} /> Upload Plan</Button>
        </Link>
      </div>

      {plans.length > 0 ? (
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2E2E2E]">
                <th className="text-left text-xs text-gray-500 px-5 py-3">Plan</th>
                <th className="text-left text-xs text-gray-500 px-5 py-3 hidden md:table-cell">Type</th>
                <th className="text-right text-xs text-gray-500 px-5 py-3">Price</th>
                <th className="text-right text-xs text-gray-500 px-5 py-3 hidden md:table-cell">Sales</th>
                <th className="text-center text-xs text-gray-500 px-5 py-3">Status</th>
                <th className="text-right text-xs text-gray-500 px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id} className="border-b border-[#2E2E2E] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-[#1E1E1E] shrink-0">
                        {plan.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={plan.thumbnail_url} alt={plan.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText size={14} className="text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{plan.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(plan.created_at)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    {plan.house_type && <Badge variant="gold" size="sm">{plan.house_type}</Badge>}
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-[#D4AF37] font-semibold">
                    {formatCurrency(plan.price)}
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-gray-400 hidden md:table-cell">
                    {plan.total_sales}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Badge variant={plan.is_published ? 'success' : 'neutral'} size="sm">
                      {plan.is_published ? 'Live' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePublish(plan)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                        title={plan.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {plan.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <Link href={`/marketplace/${plan.id}`}>
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                          <Edit size={15} />
                        </button>
                      </Link>
                      <button
                        onClick={() => setDeleteId(plan.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-16 text-center">
          <FileText size={48} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No plans yet</h3>
          <p className="text-sm text-gray-600 mb-5">Upload your first architectural plan and start earning</p>
          <Link href="/engineer/plans/upload">
            <Button variant="gold"><Plus size={16} /> Upload Your First Plan</Button>
          </Link>
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Plan">
        <div className="text-center space-y-4">
          <p className="text-gray-400">Are you sure you want to delete this plan? This action cannot be undone.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="dark" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete Plan</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
