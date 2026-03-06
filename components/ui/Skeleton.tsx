import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  count?: number
}

export default function Skeleton({ className = 'h-4 w-full', count = 1 }: SkeletonProps) {
  if (count <= 1) {
    return <div className={cn('skeleton', className)} />
  }

  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('skeleton', className)} />
      ))}
    </div>
  )
}
