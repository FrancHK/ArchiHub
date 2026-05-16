import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { FileText } from 'lucide-react'

export default async function AdminPlansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('archi_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: plans } = await supabase
    .from('archi_plans')
    .select(`
      *,
      engineer:archi_engineer_profiles!archi_plans_engineer_id_fkey(
        profile:archi_profiles!archi_engineer_profiles_user_id_fkey(full_name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>All Plans</h1>
        <p className="text-gray-400 mt-1">{plans?.length || 0} plans on platform</p>
      </div>

      <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl overflow-hidden">
        {plans && plans.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2E2E2E]">
                <th className="text-left text-xs text-gray-500 px-5 py-3">Plan</th>
                <th className="text-left text-xs text-gray-500 px-5 py-3 hidden md:table-cell">Engineer</th>
                <th className="text-right text-xs text-gray-500 px-5 py-3">Price</th>
                <th className="text-right text-xs text-gray-500 px-5 py-3 hidden md:table-cell">Sales</th>
                <th className="text-center text-xs text-gray-500 px-5 py-3">Status</th>
                <th className="text-right text-xs text-gray-500 px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id} className="border-b border-[#2E2E2E] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <Link href={`/marketplace/${plan.id}`} className="text-sm font-medium text-white hover:text-[#D4AF37] transition-colors">
                      {plan.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-400 hidden md:table-cell">
                    {(plan as { engineer?: { profile?: { full_name?: string } } }).engineer?.profile?.full_name}
                  </td>
                  <td className="px-5 py-3.5 text-right text-[#D4AF37] font-semibold">{formatCurrency(plan.price)}</td>
                  <td className="px-5 py-3.5 text-right text-sm text-gray-400 hidden md:table-cell">{plan.total_sales}</td>
                  <td className="px-5 py-3.5 text-center">
                    <Badge variant={plan.is_published ? 'success' : 'neutral'} size="sm">
                      {plan.is_published ? 'Live' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm text-gray-500">{formatDate(plan.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center">
            <FileText size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">No plans yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
