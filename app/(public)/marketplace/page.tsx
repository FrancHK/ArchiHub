import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import PlanCard from '@/components/marketplace/PlanCard'
import PlanFilters from '@/components/marketplace/PlanFilters'
import type { ArchiPlan, ArchiFilterOptions } from '@/lib/types/database'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { LayoutGrid } from 'lucide-react'

interface PageProps {
  searchParams: Promise<ArchiFilterOptions & { page?: string; sort?: string }>
}

async function PlansGrid({ searchParams }: { searchParams: Awaited<PageProps['searchParams']> }) {
  const supabase = await createClient()
  const page = parseInt(String(searchParams.page || '1'))
  const limit = 12

  let query = supabase
    .from('archi_plans')
    .select(`
      *,
      engineer:archi_engineer_profiles!archi_plans_engineer_id_fkey(
        *,
        profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*)
      )
    `, { count: 'exact' })
    .eq('is_published', true)
    .range((page - 1) * limit, page * limit - 1)

  if (searchParams.search) query = query.or(`title.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`)
  if (searchParams.house_type) query = query.eq('house_type', searchParams.house_type)
  if (searchParams.bedrooms) query = query.eq('bedrooms', Number(searchParams.bedrooms))
  if (searchParams.min_price) query = query.gte('price', Number(searchParams.min_price))
  if (searchParams.max_price) query = query.lte('price', Number(searchParams.max_price))

  switch (searchParams.sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'popular': query = query.order('total_sales', { ascending: false }); break
    default: query = query.order('created_at', { ascending: false })
  }

  const { data: plans, count } = await query

  if (!plans?.length) {
    return (
      <div className="text-center py-24">
        <LayoutGrid size={48} className="text-gray-700 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-400 mb-2">No plans found</h3>
        <p className="text-sm text-gray-600">Try adjusting your search filters</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">{count} plan{count !== 1 ? 's' : ''} found</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {(plans as ArchiPlan[]).map(plan => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  )
}

export default async function MarketplacePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            House Plan <span className="text-[#D4AF37]">Marketplace</span>
          </h1>
          <p className="text-gray-400 text-lg">Browse premium architectural plans from certified engineers</p>
        </div>

        {/* Filters */}
        <Suspense fallback={null}>
          <PlanFilters />
        </Suspense>

        {/* Plans grid */}
        <div className="mt-8">
          <Suspense fallback={
            <div className="flex justify-center py-24">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <PlansGrid searchParams={resolvedParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
