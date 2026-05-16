import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatsCard from '@/components/dashboard/StatsCard'
import { ShoppingBag, Heart, Briefcase, TrendingUp, ArrowRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { ArchiSale } from '@/lib/types/database'

export default async function CustomerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('archi_profiles').select('*').eq('id', user.id).single()
  if (profile?.role === 'engineer') redirect('/engineer')
  if (profile?.role === 'admin') redirect('/admin')

  const [
    { data: purchases, count: purchasesCount },
    { data: favorites, count: favoritesCount },
    { data: hireRequests, count: hireCount },
  ] = await Promise.all([
    supabase.from('archi_sales').select('*, plan:archi_plans(title, thumbnail_url, price)', { count: 'exact' }).eq('buyer_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('archi_favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('archi_hire_requests').select('*', { count: 'exact', head: true }).eq('client_id', user.id),
  ])

  const totalSpent = (purchases as ArchiSale[])?.reduce((sum, p) => sum + p.amount, 0) || 0

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          Welcome back, <span className="text-[#D4AF37]">{profile?.full_name?.split(' ')[0] || 'there'}</span>
        </h1>
        <p className="text-gray-400 mt-1">Here&apos;s an overview of your account activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Plans Purchased" value={purchasesCount || 0} icon={<ShoppingBag size={18} />} variant="gold" />
        <StatsCard title="Saved Plans" value={favoritesCount || 0} icon={<Heart size={18} />} />
        <StatsCard title="Hire Requests" value={hireCount || 0} icon={<Briefcase size={18} />} />
        <StatsCard title="Total Spent" value={formatCurrency(totalSpent)} icon={<TrendingUp size={18} />} />
      </div>

      {/* Recent purchases */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Recent Purchases</h2>
          <Link href="/dashboard/purchases" className="text-sm text-[#D4AF37] flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {purchases && purchases.length > 0 ? (
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2E2E2E]">
                  <th className="text-left text-xs text-gray-500 px-5 py-3">Plan</th>
                  <th className="text-right text-xs text-gray-500 px-5 py-3">Amount</th>
                  <th className="text-right text-xs text-gray-500 px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(sale => (
                  <tr key={sale.id} className="border-b border-[#2E2E2E] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-white">{(sale as { plan?: { title: string } }).plan?.title}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-[#D4AF37] font-semibold">
                      {formatCurrency(sale.amount)}
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
            <ShoppingBag size={36} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 font-medium mb-1">No purchases yet</p>
            <p className="text-sm text-gray-600 mb-4">Browse our marketplace to find the perfect plan</p>
            <Link href="/marketplace" className="text-[#D4AF37] text-sm hover:underline">Browse Plans →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
