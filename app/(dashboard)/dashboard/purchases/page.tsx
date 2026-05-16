import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { Download, ShoppingBag } from 'lucide-react'

export default async function PurchasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: purchases } = await supabase
    .from('archi_sales')
    .select(`
      *,
      plan:archi_plans(
        id, title, thumbnail_url, price, file_url, house_type,
        engineer:archi_engineer_profiles!archi_plans_engineer_id_fkey(
          profile:archi_profiles!archi_engineer_profiles_user_id_fkey(full_name)
        )
      )
    `)
    .eq('buyer_id', user.id)
    .eq('payment_status', 'completed')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-7 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>My Purchases</h1>
        <p className="text-gray-400 mt-1">All your purchased architectural plans</p>
      </div>

      {purchases && purchases.length > 0 ? (
        <div className="space-y-4">
          {purchases.map(sale => {
            const plan = sale.plan as { id: string; title: string; thumbnail_url?: string; price: number; file_url?: string; house_type?: string; engineer?: { profile?: { full_name?: string } } }
            return (
              <div key={sale.id} className="bg-[#161616] border border-[#2E2E2E] rounded-xl overflow-hidden flex items-center gap-4 p-4 hover:border-[#D4AF37]/20 transition-colors">
                {/* Thumbnail */}
                <div className="w-20 h-16 rounded-lg overflow-hidden bg-[#1E1E1E] shrink-0">
                  {plan?.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={plan.thumbnail_url} alt={plan.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={20} className="text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/marketplace/${plan?.id}`}>
                    <h3 className="font-semibold text-white hover:text-[#D4AF37] transition-colors truncate">{plan?.title}</h3>
                  </Link>
                  <p className="text-sm text-gray-400">{plan?.engineer?.profile?.full_name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {plan?.house_type && <Badge variant="gold" size="sm">{plan.house_type}</Badge>}
                    <span className="text-xs text-gray-500">{formatDate(sale.created_at)}</span>
                  </div>
                </div>

                {/* Price + download */}
                <div className="text-right shrink-0">
                  <p className="text-[#D4AF37] font-bold">{formatCurrency(sale.amount)}</p>
                  {plan?.file_url ? (
                    <a
                      href={plan.file_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#D4AF37] transition-colors mt-1"
                    >
                      <Download size={12} />
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-gray-600 mt-1 block">No file</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-16 text-center">
          <ShoppingBag size={48} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No purchases yet</h3>
          <p className="text-sm text-gray-600 mb-5">Browse the marketplace and purchase your first plan</p>
          <Link href="/marketplace" className="text-[#D4AF37] font-medium hover:underline">Browse Plans →</Link>
        </div>
      )}
    </div>
  )
}
