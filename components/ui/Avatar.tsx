import { cn, getInitials } from '@/lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps {
  name: string
  src?: string
  size?: AvatarSize
  color?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
}

const colorMap: Record<string, string> = {
  sage: 'bg-sage text-white',
  terracotta: 'bg-terracotta text-white',
  clay: 'bg-clay text-white',
  sky: 'bg-sky text-ink',
  ink: 'bg-ink text-cream',
}

export default function Avatar({ name, src, size = 'md', color = 'sage' }: AvatarProps) {
  const initials = getInitials(name)
  const colorStyle = colorMap[color] ?? colorMap.sage

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('shrink-0 rounded-full object-cover', sizeStyles[size])}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-medium',
        sizeStyles[size],
        colorStyle
      )}
      aria-label={name}
      title={name}
    >
      {initials}
    </div>
  )
}
