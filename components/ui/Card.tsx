import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  gold?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export default function Card({ children, className, hover, gold, padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div className={cn(
      'bg-[#161616] border border-[#2E2E2E] rounded-xl',
      paddings[padding],
      hover && 'transition-all duration-300 hover:border-[#D4AF37]/40 hover:shadow-lg hover:shadow-[#D4AF37]/5 hover:-translate-y-0.5',
      gold && 'border-[#D4AF37]/20 bg-gradient-to-br from-[#161616] to-[#1A1700]',
      className
    )}>
      {children}
    </div>
  )
}
