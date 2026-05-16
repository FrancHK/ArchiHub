import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlanCard from '@/components/marketplace/PlanCard'
import type { ArchiPlan } from '@/lib/types/database'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: favorites } = await supabase
    .from('archi_favorites')
    .select(`
      *,
      plan:archi_plans(
        *,
        engineer:archi_engineer_profiles!archi_plans_engineer_id_fkey(
          *,
          profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*)
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const plans = favorites?.map(f => f.plan).filter(Boolean) as ArchiPlan[]

  return (
    <div className="space-y-7 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Saved Plans</h1>
        <p className="text-gray-400 mt-1">Your favorited architectural plans</p>
      </div>

      {plans.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
        </div>
      ) : (
        <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-16 text-center">
          <Heart size={48} className="text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No saved plans</h3>
          <p className="text-sm text-gray-600 mb-5">Browse the marketplace and save plans you love</p>
          <Link href="/marketplace" className="text-[#D4AF37] font-medium hover:underline">Browse Plans →</Link>
        </div>
      )}
    </div>
  )
}
