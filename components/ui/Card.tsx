import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export default function Card({ className, children, onClick }: CardProps) {
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      className={cn(
        'rounded-xl border border-mist bg-white p-6 shadow-sm',
        onClick && 'cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Component>
  )
}
