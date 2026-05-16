import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: number; label: string }
  variant?: 'default' | 'gold'
  className?: string
}

export default function StatsCard({ title, value, subtitle, icon, trend, variant = 'default', className }: StatsCardProps) {
  return (
    <div className={cn(
      'bg-[#161616] border border-[#2E2E2E] rounded-xl p-5',
      variant === 'gold' && 'border-[#D4AF37]/20 bg-gradient-to-br from-[#161616] to-[#1A1700]',
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-gray-400">{title}</p>
        <div className={cn(
          'p-2 rounded-lg',
          variant === 'gold' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-white/5 text-gray-400'
        )}>
          {icon}
        </div>
      </div>

      <p className={cn(
        'text-3xl font-bold',
        variant === 'gold' ? 'text-[#D4AF37]' : 'text-white'
      )}>
        {value}
      </p>

      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}

      {trend && (
        <div className={cn(
          'flex items-center gap-1 mt-2 text-xs font-medium',
          trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'
        )}>
          <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
          <span className="text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
