import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatsCard from '@/components/dashboard/StatsCard'
import { Users, Building2, FileText, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('archi_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const [
    { count: totalUsers },
    { count: totalEngineers },
    { count: verifiedEngineers },
    { count: totalPlans },
    { data: salesData },
    { count: pendingWithdrawals },
    { data: recentSales },
    { data: pendingEngineers },
  ] = await Promise.all([
    supabase.from('archi_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('archi_engineer_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('archi_engineer_profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
    supabase.from('archi_plans').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('archi_sales').select('amount, commission_amount').eq('payment_status', 'completed'),
    supabase.from('archi_withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('archi_sales').select('*, plan:archi_plans(title), buyer:archi_profiles!archi_sales_buyer_id_fkey(full_name)').order('created_at', { ascending: false }).limit(8),
    supabase.from('archi_engineer_profiles').select('*, profile:archi_profiles!archi_engineer_profiles_user_id_fkey(full_name, email)').eq('is_verified', false).order('created_at', { ascending: false }).limit(5),
  ])

  const totalRevenue = salesData?.reduce((s, sale) => s + sale.amount, 0) || 0
  const totalCommission = salesData?.reduce((s, sale) => s + sale.commission_amount, 0) || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          Admin <span className="text-[#D4AF37]">Dashboard</span>
        </h1>
        <p className="text-gray-400 mt-1">Platform overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={(totalUsers || 0).toLocaleString()} icon={<Users size={18} />} />
        <StatsCard title="Active Engineers" value={verifiedEngineers || 0} icon={<Building2 size={18} />} />
        <StatsCard title="Published Plans" value={totalPlans || 0} icon={<FileText size={18} />} />
        <StatsCard title="Platform Revenue" value={formatCurrency(totalRevenue)} icon={<TrendingUp size={18} />} variant="gold" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatsCard title="Commission Earned (20%)" value={formatCurrency(totalCommission)} icon={<DollarSign size={18} />} variant="gold" />
        <StatsCard title="Pending Withdrawals" value={pendingWithdrawals || 0} icon={<AlertCircle size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent sales */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Transactions</h2>
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl overflow-hidden">
            {recentSales && recentSales.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2E2E2E]">
                    <th className="text-left text-xs text-gray-500 px-4 py-2.5">Plan</th>
                    <th className="text-right text-xs text-gray-500 px-4 py-2.5">Amount</th>
                    <th className="text-right text-xs text-gray-500 px-4 py-2.5">Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map(sale => (
                    <tr key={sale.id} className="border-b border-[#2E2E2E] last:border-0">
                      <td className="px-4 py-3 text-sm text-white truncate max-w-32">
                        {(sale as { plan?: { title: string } }).plan?.title}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-[#D4AF37]">{formatCurrency(sale.amount)}</td>
                      <td className="px-4 py-3 text-right text-sm text-emerald-400">{formatCurrency(sale.commission_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">No transactions yet</div>
            )}
          </div>
        </div>

        {/* Pending engineer approvals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Pending Approvals</h2>
            {pendingEngineers && pendingEngineers.length > 0 && (
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                {pendingEngineers.length} pending
              </span>
            )}
          </div>
          <div className="space-y-3">
            {pendingEngineers && pendingEngineers.length > 0 ? (
              pendingEngineers.map(ep => (
                <div key={ep.id} className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{(ep.profile as { full_name?: string })?.full_name}</p>
                    <p className="text-xs text-gray-500">{(ep.profile as { email?: string })?.email}</p>
                    <p className="text-xs text-gray-400">{ep.title} · {ep.experience_years}yr exp</p>
                    <p className="text-xs text-gray-500">{formatDate(ep.created_at)}</p>
                  </div>
                  <VerifyButton engineerId={ep.id} />
                </div>
              ))
            ) : (
              <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-8 text-center text-gray-500 text-sm">
                No pending approvals
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function VerifyButton({ engineerId }: { engineerId: string }) {
  return (
    <form action={async () => {
      'use server'
      const supabase = await import('@/lib/supabase/server').then(m => m.createClient())
      await supabase.from('archi_engineer_profiles').update({ is_verified: true, updated_at: new Date().toISOString() }).eq('id', engineerId)
      const { data: ep } = await supabase.from('archi_engineer_profiles').select('user_id').eq('id', engineerId).single()
      if (ep) {
        await supabase.from('archi_notifications').insert({ user_id: ep.user_id, title: 'Account Verified!', message: 'Your engineer account has been verified. You can now upload and sell plans.', type: 'system' })
      }
    }}>
      <button
        type="submit"
        className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1.5 rounded-lg hover:bg-[#D4AF37]/20 transition-colors font-medium"
      >
        Verify
      </button>
    </form>
  )
}
