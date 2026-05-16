import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatsCard from '@/components/dashboard/StatsCard'
import { FileText, DollarSign, Wallet, TrendingUp, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function EngineerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('archi_profiles').select('*').eq('id', user.id).single()
  if (profile?.role === 'customer') redirect('/dashboard')
  if (profile?.role === 'admin') redirect('/admin')

  const { data: engineerProfile } = await supabase
    .from('archi_engineer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!engineerProfile) redirect('/dashboard')

  const [
    { count: totalPlans },
    { count: publishedPlans },
    { data: wallet },
    { data: recentSales },
  ] = await Promise.all([
    supabase.from('archi_plans').select('*', { count: 'exact', head: true }).eq('engineer_id', engineerProfile.id),
    supabase.from('archi_plans').select('*', { count: 'exact', head: true }).eq('engineer_id', engineerProfile.id).eq('is_published', true),
    supabase.from('archi_wallets').select('*').eq('engineer_id', engineerProfile.id).single(),
    supabase.from('archi_sales').select('*, plan:archi_plans(title)').eq('engineer_id', engineerProfile.id).order('created_at', { ascending: false }).limit(5),
  ])

  const walletBalance = wallet?.data?.balance || 0
  const totalEarned = wallet?.data?.total_earned || 0

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Engineer <span className="text-[#D4AF37]">Dashboard</span>
          </h1>
          <p className="text-gray-400 mt-1">Welcome back, {profile?.full_name?.split(' ')[0]}</p>
        </div>
        <Link href="/engineer/plans/upload" className="bg-[#D4AF37] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#F0D060] transition-colors">
          + Upload Plan
        </Link>
      </div>

      {/* Verification notice */}
      {!engineerProfile.is_verified && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">Account Pending Verification</p>
            <p className="text-xs text-amber-400/80 mt-0.5">Your account is under review. Once verified, you can publish plans and appear in search results.</p>
          </div>
        </div>
      )}

      {engineerProfile.is_verified && (
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <CheckCircle size={16} />
          Verified Engineer — you can publish and sell plans
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Plans" value={totalPlans || 0} icon={<FileText size={18} />} />
        <StatsCard title="Published" value={publishedPlans || 0} icon={<TrendingUp size={18} />} />
        <StatsCard title="Wallet Balance" value={formatCurrency(walletBalance)} icon={<Wallet size={18} />} variant="gold" />
        <StatsCard title="Total Earned" value={formatCurrency(totalEarned)} icon={<DollarSign size={18} />} />
      </div>

      {/* Recent sales */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Recent Sales</h2>
          <Link href="/engineer/earnings" className="text-sm text-[#D4AF37] flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentSales && recentSales.length > 0 ? (
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2E2E2E]">
                  <th className="text-left text-xs text-gray-500 px-5 py-3">Plan</th>
                  <th className="text-right text-xs text-gray-500 px-5 py-3">Your Earnings</th>
                  <th className="text-right text-xs text-gray-500 px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map(sale => (
                  <tr key={sale.id} className="border-b border-[#2E2E2E] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-white">{(sale as { plan?: { title: string } }).plan?.title}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-[#D4AF37] font-semibold">
                      {formatCurrency(sale.engineer_amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-gray-500">
                      {formatDate(sale.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-10 text-center">
            <DollarSign size={36} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 font-medium mb-1">No sales yet</p>
            <p className="text-sm text-gray-600">Upload and publish plans to start earning</p>
          </div>
        )}
      </div>
    </div>
  )
}
