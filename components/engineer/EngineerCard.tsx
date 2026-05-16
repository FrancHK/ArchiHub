import Link from 'next/link'
import { MapPin, Star, Briefcase, CheckCircle } from 'lucide-react'
import type { ArchiEngineerProfile } from '@/lib/types/database'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'

interface EngineerCardProps {
  engineer: ArchiEngineerProfile & { profile?: import('@/lib/types/database').ArchiProfile }
}

export default function EngineerCard({ engineer }: EngineerCardProps) {
  const profile = engineer.profile

  return (
    <Link href={`/engineers/${engineer.id}`}>
      <div className="group bg-[#161616] border border-[#2E2E2E] rounded-2xl p-6 hover:border-[#D4AF37]/40 hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all duration-300 hover:-translate-y-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar src={profile?.avatar_url} name={profile?.full_name} size="lg" />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-white group-hover:text-[#D4AF37] transition-colors">
                  {profile?.full_name || 'Engineer'}
                </h3>
                {engineer.is_verified && (
                  <CheckCircle size={14} className="text-[#D4AF37] fill-[#D4AF37]/20" />
                )}
              </div>
              <p className="text-sm text-gray-400 mt-0.5">{engineer.title || 'Architect & Engineer'}</p>
            </div>
          </div>

          {engineer.hourly_rate && (
            <div className="text-right">
              <p className="text-[#D4AF37] font-bold">${engineer.hourly_rate}/hr</p>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          {engineer.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star size={12} className="fill-[#D4AF37] text-[#D4AF37]" />
              <span className="text-white font-medium">{engineer.rating.toFixed(1)}</span>
              ({engineer.total_reviews})
            </span>
          )}
          {engineer.experience_years > 0 && (
            <span className="flex items-center gap-1">
              <Briefcase size={12} className="text-[#D4AF37]" />
              {engineer.experience_years}yr exp
            </span>
          )}
          {profile?.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-[#D4AF37]" />
              {profile.location}
            </span>
          )}
        </div>

        {/* Skills */}
        {engineer.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {engineer.skills.slice(0, 4).map(skill => (
              <Badge key={skill} variant="neutral" size="sm">{skill}</Badge>
            ))}
            {engineer.skills.length > 4 && (
              <Badge variant="neutral" size="sm">+{engineer.skills.length - 4}</Badge>
            )}
          </div>
        )}

        {/* Total plans sold */}
        {engineer.total_sales > 0 && (
          <p className="text-xs text-gray-500 border-t border-[#2E2E2E] pt-3">
            <span className="text-[#D4AF37] font-semibold">{engineer.total_sales}</span> plans sold
          </p>
        )}
      </div>
    </Link>
  )
}
