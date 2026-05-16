import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import { Briefcase } from 'lucide-react'
import Link from 'next/link'
import type { ArchiHireRequest } from '@/lib/types/database'

const statusVariants: Record<string, 'gold' | 'success' | 'danger' | 'warning' | 'neutral'> = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'danger',
  in_progress: 'gold',
  completed: 'success',
  cancelled: 'neutral',
}

const stageLabels: Record<string, string> = {
  planning: 'Planning',
  foundation: 'Foundation',
  walling: 'Walling',
  roofing: 'Roofing',
  finishing: 'Finishing',
}

export default async function HireRequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: requests } = await supabase
    .from('archi_hire_requests')
    .select(`
      *,
      engineer:archi_engineer_profiles!archi_hire_requests_engineer_id_fkey(
        id, title, rating,
        profile:archi_profiles!archi_engineer_profiles_user_id_fkey(full_name, avatar_url)
      )
    `)
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-7 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Hire Requests</h1>
          <p className="text-gray-400 mt-1">Track your engineer hiring requests</p>
        </div>
        <Link href="/engineers" className="text-sm text-[#D4AF37] border border-[#D4AF37]/30 px-4 py-2 rounded-lg hover:bg-[#D4AF37]/10 transition-colors">
          + Hire Engineer
        </Link>
      </div>

      {requests && requests.length > 0 ? (
        <div className="space-y-4">
          {(requests as ArchiHireRequest[]).map(req => {
            const eng = req.engineer as { id: string; title?: string; rating?: number; profile?: { full_name?: string; avatar_url?: string } }
            return (
              <div key={req.id} className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-5 hover:border-[#D4AF37]/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={eng?.profile?.avatar_url} name={eng?.profile?.full_name} size="md" />
                    <div>
                      <h3 className="font-semibold text-white">{req.project_title}</h3>
                      <p className="text-sm text-gray-400">{eng?.profile?.full_name} — {eng?.title}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={statusVariants[req.status] || 'neutral'} size="sm">
                      {req.status.replace('_', ' ')}
                    </Badge>
                    {req.current_stage && (
                      <Badge variant="gold" size="sm">
                        Stage: {stageLabels[req.current_stage]}
                      </Badge>
                    )}
                  </div>
                </div>

                {req.description && (
                  <p className="text-sm text-gray-400 mt-3 line-clamp-2">{req.description}</p>
                )}

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  {req.budget_min && req.budget_max && (
                    <span>Budget: ${req.budget_min.toLocaleString()} – ${req.budget_max.toLocaleString()}</span>
                  )}
                  {req.location && <span>📍 {req.location}</span>}
                  <span>{formatDate(req.created_at)}</span>
                </div>

                {req.status === 'in_progress' && req.current_stage && (
                  <div className="mt-4">
                    <div className="flex items-center gap-1 mb-2">
                      {['planning', 'foundation', 'walling', 'roofing', 'finishing'].map((stage, i) => {
                        const stages = ['planning', 'foundation', 'walling', 'roofing', 'finishing']
                        const currentIndex = stages.indexOf(req.current_stage || '')
                        const isDone = i <= currentIndex
                        return (
                          <div key={stage} className="flex-1 flex items-center">
                            <div className={`h-1.5 rounded-full flex-1 transition-colors ${isDone ? 'bg-[#D4AF37]' : 'bg-[#2E2E2E]'}`} />
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-600">
                      {['Planning', 'Foundation', 'Walling', 'Roofing', 'Finishing'].map(s => (
                        <span key={s}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-16 text-center">
          <Briefcase size={48} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No hire requests yet</h3>
          <p className="text-sm text-gray-600 mb-5">Find a verified engineer and send them a project request</p>
          <Link href="/engineers" className="text-[#D4AF37] font-medium hover:underline">Browse Engineers →</Link>
        </div>
      )}
    </div>
  )
}
