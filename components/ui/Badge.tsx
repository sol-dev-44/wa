import { cn } from '@/lib/utils'

type BadgeVariant = 'sage' | 'terracotta' | 'sky' | 'clay' | 'mist'

export interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const variantStyles: Record<BadgeVariant, string> = {
  sage: 'bg-sage/15 text-sage-deep',
  terracotta: 'bg-terracotta/15 text-terracotta',
  sky: 'bg-sky/20 text-ink',
  clay: 'bg-clay/15 text-ink',
  mist: 'bg-mist text-ink/70',
}

export default function Badge({ variant, children, className, onClick }: BadgeProps) {
  const Component = onClick ? 'button' : 'span'
  return (
    <Component
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
    >
      {children}
    </Component>
  )
}
