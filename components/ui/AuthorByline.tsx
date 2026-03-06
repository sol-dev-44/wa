'use client'

import { useAppSelector } from '@/lib/store/store'
import { useGetCoParentsQuery } from '@/lib/store/api'

interface AuthorBylineProps {
  authorId: string
  className?: string
}

export default function AuthorByline({ authorId, className }: AuthorBylineProps) {
  const activeChildId = useAppSelector((state) => state.app.activeChildId)
  const { data: coParents } = useGetCoParentsQuery(activeChildId!, {
    skip: !activeChildId,
  })

  const parent = coParents?.find((cp) => cp.user_id === authorId)
  if (!parent) return null

  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: parent.color }}
        aria-hidden="true"
      />
      <span className="text-sm text-ink/50">{parent.label}</span>
    </span>
  )
}
