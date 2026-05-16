import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import StatsCard from '@/components/dashboard/StatsCard'
import { DollarSign, TrendingUp } from 'lucide-react'

export default async function AdminTransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('archi_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: sales } = await supabase
    .from('archi_sales')
    .select(`
      *,
      plan:archi_plans(title),
      buyer:archi_profiles!archi_sales_buyer_id_fkey(full_name),
      engineer:archi_engineer_profiles!archi_sales_engineer_id_fkey(
        profile:archi_profiles!archi_engineer_profiles_user_id_fkey(full_name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const totalRevenue = sales?.reduce((s, sale) => s + sale.amount, 0) || 0
  const totalCommission = sales?.reduce((s, sale) => s + sale.commission_amount, 0) || 0

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Transactions</h1>
        <p className="text-gray-400 mt-1">All platform sales and commission tracking</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<TrendingUp size={18} />} variant="gold" />
        <StatsCard title="Commission (20%)" value={formatCurrency(totalCommission)} icon={<DollarSign size={18} />} variant="gold" />
        <StatsCard title="Total Sales" value={sales?.length || 0} icon={<TrendingUp size={18} />} />
        <StatsCard title="Avg Transaction" value={formatCurrency(sales?.length ? totalRevenue / sales.length : 0)} icon={<DollarSign size={18} />} />
      </div>

      <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2E2E2E]">
              <th className="text-left text-xs text-gray-500 px-5 py-3">Plan</th>
              <th className="text-left text-xs text-gray-500 px-5 py-3 hidden lg:table-cell">Buyer</th>
              <th className="text-left text-xs text-gray-500 px-5 py-3 hidden md:table-cell">Engineer</th>
              <th className="text-right text-xs text-gray-500 px-5 py-3">Amount</th>
              <th className="text-right text-xs text-gray-500 px-5 py-3 hidden md:table-cell">Commission</th>
              <th className="text-center text-xs text-gray-500 px-5 py-3">Status</th>
              <th className="text-right text-xs text-gray-500 px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {sales?.map(sale => (
              <tr key={sale.id} className="border-b border-[#2E2E2E] last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3.5 text-sm text-white max-w-32 truncate">
                  {(sale as { plan?: { title: string } }).plan?.title}
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-400 hidden lg:table-cell">
                  {(sale as { buyer?: { full_name: string } }).buyer?.full_name}
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-400 hidden md:table-cell">
                  {((sale as { engineer?: { profile?: { full_name?: string } } }).engineer?.profile?.full_name)}
                </td>
                <td className="px-5 py-3.5 text-right text-[#D4AF37] font-semibold">{formatCurrency(sale.amount)}</td>
                <td className="px-5 py-3.5 text-right text-emerald-400 text-sm hidden md:table-cell">{formatCurrency(sale.commission_amount)}</td>
                <td className="px-5 py-3.5 text-center">
                  <Badge variant={sale.payment_status === 'completed' ? 'success' : 'warning'} size="sm">
                    {sale.payment_status}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-right text-sm text-gray-500">{formatDate(sale.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
