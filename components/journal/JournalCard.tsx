'use client'

import Card from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { formatRelativeDate } from '@/lib/utils'
import { useGetCoParentsQuery } from '@/lib/store/api'
import { useAppSelector } from '@/lib/store/store'
import type { Tables } from '@/types/database'

interface JournalCardProps {
  entry: Tables<'journal_entries'>
  onClick: () => void
}

export default function JournalCard({ entry, onClick }: JournalCardProps) {
  const activeChildId = useAppSelector((state) => state.app.activeChildId)
  const { data: coParents } = useGetCoParentsQuery(activeChildId!, {
    skip: !activeChildId,
  })

  const authorParent = coParents?.find((cp) => cp.user_id === entry.author_id)
  const authorName = authorParent?.label ?? 'Parent'

  const bodyExcerpt =
    entry.body.length > 160 ? entry.body.slice(0, 160) + '...' : entry.body

  const displayDate = entry.entry_date
    ? new Date(entry.entry_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : formatRelativeDate(entry.created_at)

  return (
    <Card onClick={onClick} className="group">
      <div className="flex items-start gap-4">
        <Avatar name={authorName} size="sm" color={authorParent?.color ?? 'sage'} />

        <div className="min-w-0 flex-1">
          {/* Date + Mood */}
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-sm text-ink/50">
              {displayDate}
            </span>
            {entry.mood && <span className="text-lg">{entry.mood}</span>}
          </div>

          {/* Title */}
          <h3 className="font-serif text-xl font-semibold text-ink group-hover:text-sage-deep transition-colors">
            {entry.title}
          </h3>

          {/* Body excerpt */}
          <p className="mt-1.5 line-clamp-2 text-base text-ink/60">{bodyExcerpt}</p>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.tags.map((tag) => (
                <Badge key={tag} variant="mist">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
