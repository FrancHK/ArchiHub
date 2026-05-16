'use client'

import { useEffect, useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Shield, ShieldOff, CheckCircle } from 'lucide-react'

interface EngineerRow {
  id: string
  title: string
  experience_years: number
  is_verified: boolean
  is_active: boolean
  rating: number
  total_sales: number
  created_at: string
  profile?: { full_name?: string; email?: string; avatar_url?: string }
}

export default function AdminEngineersPage() {
  const [engineers, setEngineers] = useState<EngineerRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/engineers')
      .then(r => r.json())
      .then(d => { setEngineers(d.engineers || []); setLoading(false) })
  }, [])

  const toggleVerification = async (id: string, current: boolean) => {
    const res = await fetch('/api/admin/engineers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_verified: !current }),
    })
    if (res.ok) {
      setEngineers(prev => prev.map(e => e.id === id ? { ...e, is_verified: !current } : e))
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="h-8 w-8 rounded-full border-2 border-[#2E2E2E] border-t-[#D4AF37] animate-spin" /></div>

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Manage Engineers</h1>
        <p className="text-gray-400 mt-1">{engineers.length} registered engineers</p>
      </div>

      <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2E2E2E]">
              <th className="text-left text-xs text-gray-500 px-5 py-3">Engineer</th>
              <th className="text-left text-xs text-gray-500 px-5 py-3 hidden md:table-cell">Title</th>
              <th className="text-center text-xs text-gray-500 px-5 py-3">Status</th>
              <th className="text-right text-xs text-gray-500 px-5 py-3 hidden md:table-cell">Sales</th>
              <th className="text-right text-xs text-gray-500 px-5 py-3 hidden md:table-cell">Joined</th>
              <th className="text-center text-xs text-gray-500 px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {engineers.map(eng => (
              <tr key={eng.id} className="border-b border-[#2E2E2E] last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={eng.profile?.avatar_url} name={eng.profile?.full_name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-white">{eng.profile?.full_name}</p>
                      <p className="text-xs text-gray-500">{eng.profile?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-400 hidden md:table-cell">{eng.title}</td>
                <td className="px-5 py-3.5 text-center">
                  <Badge variant={eng.is_verified ? 'success' : 'warning'} size="sm">
                    {eng.is_verified ? <><CheckCircle size={10} /> Verified</> : 'Pending'}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-right text-sm text-gray-400 hidden md:table-cell">{eng.total_sales}</td>
                <td className="px-5 py-3.5 text-right text-sm text-gray-500 hidden md:table-cell">{formatDate(eng.created_at)}</td>
                <td className="px-5 py-3.5 text-center">
                  <button
                    onClick={() => toggleVerification(eng.id, eng.is_verified)}
                    className={`p-1.5 rounded-lg transition-colors ${eng.is_verified ? 'text-red-400 hover:bg-red-500/10' : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}
                    title={eng.is_verified ? 'Revoke verification' : 'Verify engineer'}
                  >
                    {eng.is_verified ? <ShieldOff size={16} /> : <Shield size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
