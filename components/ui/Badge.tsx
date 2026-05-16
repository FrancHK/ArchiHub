import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'gold' | 'success' | 'danger' | 'warning' | 'neutral' | 'outline'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({ children, variant = 'neutral', size = 'sm', className }: BadgeProps) {
  const variants = {
    gold: 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    neutral: 'bg-white/10 text-gray-300 border border-white/10',
    outline: 'border border-[#D4AF37] text-[#D4AF37]',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  }

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full font-medium', variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}
