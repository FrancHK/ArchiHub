import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import StatsCard from '@/components/dashboard/StatsCard'
import { DollarSign, TrendingUp, ShoppingBag } from 'lucide-react'

export default async function EarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: ep } = await supabase.from('archi_engineer_profiles').select('id').eq('user_id', user.id).single()
  if (!ep) redirect('/dashboard')

  const { data: sales } = await supabase
    .from('archi_sales')
    .select('*, plan:archi_plans(title, thumbnail_url)')
    .eq('engineer_id', ep.id)
    .order('created_at', { ascending: false })

  const totalEarned = sales?.reduce((s, sale) => s + sale.engineer_amount, 0) || 0
  const totalSales = sales?.length || 0
  const avgSale = totalSales > 0 ? totalEarned / totalSales : 0

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Earnings</h1>
        <p className="text-gray-400 mt-1">Your complete earnings history (80% of each sale)</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard title="Total Earned" value={formatCurrency(totalEarned)} icon={<DollarSign size={18} />} variant="gold" />
        <StatsCard title="Total Sales" value={totalSales} icon={<ShoppingBag size={18} />} />
        <StatsCard title="Avg Sale" value={formatCurrency(avgSale)} icon={<TrendingUp size={18} />} />
      </div>

      {/* Commission notice */}
      <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl p-4 text-sm text-gray-400">
        <p><span className="text-[#D4AF37] font-semibold">Commission structure:</span> You earn 80% of every sale. ArchiHub retains 20% as a platform fee.</p>
      </div>

      {sales && sales.length > 0 ? (
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2E2E2E]">
                <th className="text-left text-xs text-gray-500 px-5 py-3">Plan</th>
                <th className="text-right text-xs text-gray-500 px-5 py-3 hidden md:table-cell">Sale Price</th>
                <th className="text-right text-xs text-gray-500 px-5 py-3 hidden md:table-cell">Commission (20%)</th>
                <th className="text-right text-xs text-gray-500 px-5 py-3">Your Earnings</th>
                <th className="text-right text-xs text-gray-500 px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale.id} className="border-b border-[#2E2E2E] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 text-sm text-white">
                    {(sale as { plan?: { title: string } }).plan?.title}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm text-gray-400 hidden md:table-cell">
                    {formatCurrency(sale.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-sm text-red-400/70 hidden md:table-cell">
                    -{formatCurrency(sale.commission_amount)}
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
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-16 text-center">
          <DollarSign size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No sales yet. Publish plans to start earning.</p>
        </div>
      )}
    </div>
  )
}
