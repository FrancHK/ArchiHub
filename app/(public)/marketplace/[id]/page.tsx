import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ArchiPlan } from '@/lib/types/database'
import { formatCurrency, formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import StarRating from '@/components/ui/StarRating'
import PurchaseButton from './PurchaseButton'
import PlanCard from '@/components/marketplace/PlanCard'
import { BedDouble, Bath, Maximize2, Layers, Calendar, Download, CheckCircle } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PlanDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: plan } = await supabase
    .from('archi_plans')
    .select(`
      *,
      engineer:archi_engineer_profiles!archi_plans_engineer_id_fkey(
        *,
        profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*)
      )
    `)
    .eq('id', id)
    .single()

  if (!plan) notFound()

  const typedPlan = plan as ArchiPlan

  const { data: reviews } = await supabase
    .from('archi_reviews')
    .select('*, reviewer:archi_profiles!archi_reviews_reviewer_id_fkey(*)')
    .eq('plan_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: relatedPlans } = await supabase
    .from('archi_plans')
    .select('*, engineer:archi_engineer_profiles!archi_plans_engineer_id_fkey(*, profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*))')
    .eq('is_published', true)
    .eq('house_type', typedPlan.house_type || '')
    .neq('id', id)
    .limit(3)

  const engineer = typedPlan.engineer
  const engineerProfile = engineer?.profile

  const { data: { user } } = await supabase.auth.getUser()
  let alreadyPurchased = false
  if (user) {
    const { data: sale } = await supabase
      .from('archi_sales')
      .select('id')
      .eq('plan_id', id)
      .eq('buyer_id', user.id)
      .single()
    alreadyPurchased = !!sale
  }

  const specs = [
    { label: 'Bedrooms', value: typedPlan.bedrooms, icon: <BedDouble size={16} /> },
    { label: 'Bathrooms', value: typedPlan.bathrooms, icon: <Bath size={16} /> },
    { label: 'Floors', value: typedPlan.floors, icon: <Layers size={16} /> },
    { label: 'Area', value: typedPlan.area_sqft ? `${typedPlan.area_sqft.toLocaleString()} sqft` : null, icon: <Maximize2 size={16} /> },
  ].filter(s => s.value != null)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image */}
            <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-[#1E1E1E]">
              {typedPlan.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={typedPlan.thumbnail_url} alt={typedPlan.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-10 h-10 text-[#D4AF37]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No preview available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-3">
                {typedPlan.house_type && <Badge variant="gold">{typedPlan.house_type}</Badge>}
                {typedPlan.total_sales > 0 && (
                  <Badge variant="neutral">{typedPlan.total_sales} sold</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                {typedPlan.title}
              </h1>
              <p className="text-gray-400 flex items-center gap-2 text-sm">
                <Calendar size={14} />
                {formatDate(typedPlan.created_at)}
              </p>
            </div>

            {/* Specs */}
            {specs.length > 0 && (
              <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-5">
                <h3 className="font-semibold text-white mb-4">Plan Specifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {specs.map(spec => (
                    <div key={spec.label} className="text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[#D4AF37] mb-1">
                        {spec.icon}
                        <span className="text-xs text-gray-400">{spec.label}</span>
                      </div>
                      <p className="text-lg font-bold text-white">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {typedPlan.description && (
              <div>
                <h3 className="font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-400 leading-relaxed">{typedPlan.description}</p>
              </div>
            )}

            {/* What's included */}
            <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4">What&apos;s Included</h3>
              <ul className="space-y-2.5">
                {['Floor plan drawings', 'Elevation drawings', 'Section drawings', 'Foundation plan', 'Roof plan', 'Electrical layout'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <CheckCircle size={14} className="text-[#D4AF37] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Engineer info */}
            {engineer && (
              <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-5">
                <h3 className="font-semibold text-white mb-4">About the Engineer</h3>
                <Link href={`/engineers/${engineer.id}`} className="flex items-start gap-4 group">
                  <Avatar src={engineerProfile?.avatar_url} name={engineerProfile?.full_name} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                        {engineerProfile?.full_name || 'Engineer'}
                      </p>
                      {engineer.is_verified && <CheckCircle size={14} className="text-[#D4AF37]" />}
                    </div>
                    <p className="text-sm text-gray-400">{engineer.title}</p>
                    {engineer.rating > 0 && <StarRating rating={engineer.rating} showValue className="mt-1" />}
                    {engineerProfile?.bio && <p className="text-sm text-gray-400 mt-2 line-clamp-2">{engineerProfile.bio}</p>}
                  </div>
                </Link>
              </div>
            )}

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <div>
                <h3 className="font-semibold text-white mb-4">Reviews ({reviews.length})</h3>
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={(review.reviewer as { avatar_url?: string })?.avatar_url} name={(review.reviewer as { full_name?: string })?.full_name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-white">{(review.reviewer as { full_name?: string })?.full_name || 'User'}</p>
                            <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      {review.comment && <p className="text-sm text-gray-400 italic">&ldquo;{review.comment}&rdquo;</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="sticky top-24">
              <div className="bg-[#161616] border border-[#D4AF37]/20 rounded-2xl p-6 space-y-5">
                <div>
                  <p className="text-gray-400 text-sm">Price</p>
                  <p className="text-4xl font-bold text-[#D4AF37]">{formatCurrency(typedPlan.price)}</p>
                </div>

                <PurchaseButton
                  planId={typedPlan.id}
                  planTitle={typedPlan.title}
                  price={typedPlan.price}
                  isPublished={typedPlan.is_published}
                  alreadyPurchased={alreadyPurchased}
                  fileUrl={typedPlan.file_url}
                  isLoggedIn={!!user}
                />

                <div className="text-center text-xs text-gray-500 border-t border-[#2E2E2E] pt-4 space-y-1.5">
                  <p className="flex items-center justify-center gap-1.5">
                    <Download size={12} />
                    Instant PDF download after purchase
                  </p>
                  <p className="flex items-center justify-center gap-1.5">
                    <CheckCircle size={12} className="text-[#D4AF37]" />
                    Secure payment guaranteed
                  </p>
                </div>
              </div>

              {engineer && (
                <Link href={`/engineers/${engineer.id}?hire=true`} className="block mt-4">
                  <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-4 text-center hover:border-[#D4AF37]/30 transition-colors cursor-pointer">
                    <p className="text-sm font-medium text-white mb-0.5">Need site supervision?</p>
                    <p className="text-xs text-[#D4AF37]">Hire this engineer →</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Related plans */}
        {relatedPlans && relatedPlans.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Related Plans</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedPlans.map(p => (
                <PlanCard key={p.id} plan={p as ArchiPlan} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
