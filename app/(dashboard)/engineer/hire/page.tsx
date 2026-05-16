import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { formatDate } from '@/lib/utils'
import { Briefcase } from 'lucide-react'
import EngineerHireActions from './EngineerHireActions'

export default async function EngineerHirePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: ep } = await supabase.from('archi_engineer_profiles').select('id').eq('user_id', user.id).single()
  if (!ep) redirect('/dashboard')

  const { data: requests } = await supabase
    .from('archi_hire_requests')
    .select(`
      *,
      client:archi_profiles!archi_hire_requests_client_id_fkey(full_name, avatar_url, email)
    `)
    .eq('engineer_id', ep.id)
    .order('created_at', { ascending: false })

  const statusVariants: Record<string, 'gold' | 'success' | 'danger' | 'warning' | 'neutral'> = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'danger',
    in_progress: 'gold',
    completed: 'success',
    cancelled: 'neutral',
  }

  return (
    <div className="space-y-7 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Hire Requests</h1>
        <p className="text-gray-400 mt-1">Project requests from clients</p>
      </div>

      {requests && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map(req => {
            const client = req.client as { full_name?: string; avatar_url?: string; email?: string }
            return (
              <div key={req.id} className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={client?.avatar_url} name={client?.full_name} size="md" />
                    <div>
                      <h3 className="font-semibold text-white">{req.project_title}</h3>
                      <p className="text-sm text-gray-400">{client?.full_name} · {client?.email}</p>
                    </div>
                  </div>
                  <Badge variant={statusVariants[req.status] || 'neutral'} size="sm">
                    {req.status.replace('_', ' ')}
                  </Badge>
                </div>

                {req.description && <p className="text-sm text-gray-400 mb-3">{req.description}</p>}

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  {req.budget_min && req.budget_max && <span>Budget: ${req.budget_min.toLocaleString()}–${req.budget_max.toLocaleString()}</span>}
                  {req.location && <span>📍 {req.location}</span>}
                  <span>{formatDate(req.created_at)}</span>
                </div>

                {req.status === 'pending' && (
                  <EngineerHireActions requestId={req.id} engineerId={ep.id} />
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-16 text-center">
          <Briefcase size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No hire requests yet</p>
        </div>
      )}
    </div>
  )
}
