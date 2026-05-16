import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatsCard from '@/components/dashboard/StatsCard'
import { BarChart2, DollarSign, ShoppingBag, Star, TrendingUp, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: ep } = await supabase.from('archi_engineer_profiles').select('*').eq('user_id', user.id).single()
  if (!ep) redirect('/dashboard')

  const [
    { count: totalPlans },
    { count: publishedPlans },
    { data: salesData },
    { data: wallet },
    { data: topPlans },
  ] = await Promise.all([
    supabase.from('archi_plans').select('*', { count: 'exact', head: true }).eq('engineer_id', ep.id),
    supabase.from('archi_plans').select('*', { count: 'exact', head: true }).eq('engineer_id', ep.id).eq('is_published', true),
    supabase.from('archi_sales').select('amount, engineer_amount, created_at').eq('engineer_id', ep.id),
    supabase.from('archi_wallets').select('*').eq('engineer_id', ep.id).single(),
    supabase.from('archi_plans').select('id, title, total_sales, price').eq('engineer_id', ep.id).order('total_sales', { ascending: false }).limit(5),
  ])

  const totalRevenue = salesData?.reduce((s, sale) => s + sale.engineer_amount, 0) || 0
  const totalSales = salesData?.length || 0

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Analytics</h1>
        <p className="text-gray-400 mt-1">Track your performance and earnings</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Plans" value={totalPlans || 0} icon={<FileText size={18} />} />
        <StatsCard title="Published" value={publishedPlans || 0} icon={<TrendingUp size={18} />} />
        <StatsCard title="Total Sales" value={totalSales} icon={<ShoppingBag size={18} />} />
        <StatsCard title="Total Earned" value={formatCurrency(totalRevenue)} icon={<DollarSign size={18} />} variant="gold" />
        <StatsCard title="Wallet Balance" value={formatCurrency(wallet?.data?.balance || 0)} icon={<BarChart2 size={18} />} variant="gold" />
        <StatsCard title="Rating" value={`${ep.rating.toFixed(1)} ★`} icon={<Star size={18} />} />
      </div>

      {topPlans && topPlans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Top Performing Plans</h2>
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2E2E2E]">
                  <th className="text-left text-xs text-gray-500 px-5 py-3">Plan</th>
                  <th className="text-right text-xs text-gray-500 px-5 py-3">Price</th>
                  <th className="text-right text-xs text-gray-500 px-5 py-3">Sales</th>
                  <th className="text-right text-xs text-gray-500 px-5 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topPlans.map(plan => (
                  <tr key={plan.id} className="border-b border-[#2E2E2E] last:border-0">
                    <td className="px-5 py-3 text-sm text-white">{plan.title}</td>
                    <td className="px-5 py-3 text-right text-sm text-gray-400">{formatCurrency(plan.price)}</td>
                    <td className="px-5 py-3 text-right text-sm text-[#D4AF37]">{plan.total_sales}</td>
                    <td className="px-5 py-3 text-right text-sm text-[#D4AF37] font-semibold">{formatCurrency(plan.price * plan.total_sales * 0.8)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
