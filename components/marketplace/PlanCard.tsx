'use client'

import Link from 'next/link'
import { Heart, BedDouble, Bath, Maximize2, Star } from 'lucide-react'
import type { ArchiPlan } from '@/lib/types/database'
import { formatCurrency } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'

interface PlanCardProps {
  plan: ArchiPlan
  onFavorite?: (id: string) => void
  isFavorited?: boolean
}

export default function PlanCard({ plan, onFavorite, isFavorited }: PlanCardProps) {
  const engineer = plan.engineer
  const engineerName = engineer?.profile?.full_name || 'ArchiHub Engineer'
  const rating = engineer?.rating || 0

  return (
    <div className="group bg-[#161616] border border-[#2E2E2E] rounded-2xl overflow-hidden hover:border-[#D4AF37]/40 hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#1E1E1E]">
        {plan.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={plan.thumbnail_url}
            alt={plan.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-[#D4AF37]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <p className="text-xs text-gray-600">No preview</p>
            </div>
          </div>
        )}

        {/* Overlay actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {onFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); onFavorite(plan.id) }}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${isFavorited ? 'bg-[#D4AF37] text-black' : 'bg-black/50 text-white hover:bg-[#D4AF37] hover:text-black'}`}
            >
              <Heart size={14} className={isFavorited ? 'fill-current' : ''} />
            </button>
          )}
        </div>

        {/* Type badge */}
        {plan.house_type && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="gold">{plan.house_type}</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <Link href={`/marketplace/${plan.id}`}>
          <h3 className="font-semibold text-white text-base leading-snug mb-1 hover:text-[#D4AF37] transition-colors line-clamp-2">
            {plan.title}
          </h3>
        </Link>

        {/* Specs */}
        <div className="flex items-center gap-4 text-xs text-gray-500 my-3">
          {plan.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble size={12} className="text-[#D4AF37]" />
              {plan.bedrooms} bed
            </span>
          )}
          {plan.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath size={12} className="text-[#D4AF37]" />
              {plan.bathrooms} bath
            </span>
          )}
          {plan.area_sqft != null && (
            <span className="flex items-center gap-1">
              <Maximize2 size={12} className="text-[#D4AF37]" />
              {plan.area_sqft.toLocaleString()} sqft
            </span>
          )}
        </div>

        {/* Engineer */}
        <div className="flex items-center justify-between">
          <Link href={`/engineers/${engineer?.id || '#'}`} className="flex items-center gap-2 group/eng">
            <Avatar src={engineer?.profile?.avatar_url} name={engineerName} size="xs" />
            <div>
              <p className="text-xs font-medium text-gray-300 group-hover/eng:text-[#D4AF37] transition-colors">{engineerName}</p>
              {rating > 0 && (
                <div className="flex items-center gap-0.5">
                  <Star size={10} className="fill-[#D4AF37] text-[#D4AF37]" />
                  <span className="text-[10px] text-gray-500">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </Link>

          <div className="text-right">
            <p className="text-[#D4AF37] font-bold text-lg">{formatCurrency(plan.price)}</p>
            {plan.total_sales > 0 && (
              <p className="text-[10px] text-gray-500">{plan.total_sales} sold</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
