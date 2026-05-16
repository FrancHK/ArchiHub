import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ size = 'md', className, fullScreen }: LoadingSpinnerProps) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-3' }

  const spinner = (
    <div className={cn(
      'rounded-full border-[#2E2E2E] border-t-[#D4AF37] animate-spin',
      sizes[size],
      className
    )} />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0B0B]/80 backdrop-blur-sm">
        {spinner}
      </div>
    )
  }

  return spinner
}
