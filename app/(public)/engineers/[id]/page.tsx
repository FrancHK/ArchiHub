import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ArchiPlan } from '@/lib/types/database'
import { formatCurrency } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import StarRating from '@/components/ui/StarRating'
import PlanCard from '@/components/marketplace/PlanCard'
import HireButton from './HireButton'
import { CheckCircle, Briefcase, MapPin, Clock } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EngineerProfilePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: engineer } = await supabase
    .from('archi_engineer_profiles')
    .select(`
      *,
      profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*)
    `)
    .eq('id', id)
    .single()

  if (!engineer) notFound()

  const profile = engineer.profile as { full_name?: string; avatar_url?: string; bio?: string; location?: string }

  const { data: plans } = await supabase
    .from('archi_plans')
    .select('*, engineer:archi_engineer_profiles!archi_plans_engineer_id_fkey(*, profile:archi_profiles!archi_engineer_profiles_user_id_fkey(*))')
    .eq('engineer_id', id)
    .eq('is_published', true)
    .order('total_sales', { ascending: false })

  const { data: reviews } = await supabase
    .from('archi_reviews')
    .select('*, reviewer:archi_profiles!archi_reviews_reviewer_id_fkey(*)')
    .eq('engineer_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Profile card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              <div className="bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 text-center">
                <Avatar src={profile?.avatar_url} name={profile?.full_name} size="xl" className="mx-auto mb-4" />
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <h1 className="text-xl font-bold text-white">{profile?.full_name || 'Engineer'}</h1>
                  {engineer.is_verified && <CheckCircle size={16} className="text-[#D4AF37]" />}
                </div>
                <p className="text-[#D4AF37] text-sm mb-3">{engineer.title}</p>

                {engineer.rating > 0 && (
                  <StarRating rating={engineer.rating} showValue className="justify-center mb-3" />
                )}

                <div className="space-y-2 text-sm text-gray-400">
                  {profile?.location && (
                    <p className="flex items-center justify-center gap-1.5">
                      <MapPin size={14} className="text-[#D4AF37]" />
                      {profile.location}
                    </p>
                  )}
                  {engineer.experience_years > 0 && (
                    <p className="flex items-center justify-center gap-1.5">
                      <Briefcase size={14} className="text-[#D4AF37]" />
                      {engineer.experience_years} years experience
                    </p>
                  )}
                  {engineer.hourly_rate && (
                    <p className="flex items-center justify-center gap-1.5">
                      <Clock size={14} className="text-[#D4AF37]" />
                      {formatCurrency(engineer.hourly_rate)}/hr
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-[#2E2E2E]">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#D4AF37]">{plans?.length || 0}</p>
                    <p className="text-xs text-gray-500">Plans</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#D4AF37]">{engineer.total_sales}</p>
                    <p className="text-xs text-gray-500">Sales</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#D4AF37]">{engineer.total_reviews}</p>
                    <p className="text-xs text-gray-500">Reviews</p>
                  </div>
                </div>

                <div className="mt-5">
                  <HireButton engineerId={id} engineerName={profile?.full_name || 'Engineer'} isLoggedIn={!!user} />
                </div>
              </div>

              {/* Skills */}
              {engineer.skills.length > 0 && (
                <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {engineer.skills.map((skill: string) => (
                      <Badge key={skill} variant="neutral">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {engineer.certifications.length > 0 && (
                <div className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-5">
                  <h3 className="font-semibold text-white mb-3">Certifications</h3>
                  <ul className="space-y-2">
                    {engineer.certifications.map((cert: string) => (
                      <li key={cert} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle size={14} className="text-[#D4AF37]" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Bio */}
            {profile?.bio && (
              <div>
                <h2 className="text-xl font-bold text-white mb-3">About</h2>
                <p className="text-gray-400 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Plans */}
            {plans && plans.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-5">Plans by {profile?.full_name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {(plans as ArchiPlan[]).map(plan => (
                    <PlanCard key={plan.id} plan={plan} />
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-5">Client Reviews</h2>
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-[#161616] border border-[#2E2E2E] rounded-xl p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={(review.reviewer as { avatar_url?: string })?.avatar_url} name={(review.reviewer as { full_name?: string })?.full_name} size="sm" />
                          <p className="text-sm font-medium text-white">{(review.reviewer as { full_name?: string })?.full_name || 'Client'}</p>
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
        </div>
      </div>
    </div>
  )
}
