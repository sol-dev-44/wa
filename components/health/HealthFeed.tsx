'use client'

import { useMemo, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { Heart, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { useUpdateHealthNoteMutation } from '@/lib/store/api'
import AuthorByline from '@/components/ui/AuthorByline'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'

type Filter = 'all' | 'active' | 'resolved'

interface HealthFeedProps {
  notes: Tables<'health_notes'>[]
  filter: Filter
  onEdit: (note: Tables<'health_notes'>) => void
}

const typeBadgeVariant: Record<string, 'sage' | 'terracotta' | 'sky' | 'clay' | 'mist'> = {
  Medication: 'sage',
  Appointment: 'sky',
  Allergy: 'terracotta',
  Wellness: 'sage',
  Injury: 'terracotta',
  Dental: 'clay',
  Vision: 'sky',
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export default function HealthFeed({ notes, filter, onEdit }: HealthFeedProps) {
  const [updateNote] = useUpdateHealthNoteMutation()

  const filtered = useMemo(() => {
    let result = [...notes]
    if (filter === 'active') result = result.filter((n) => !n.is_resolved)
    if (filter === 'resolved') result = result.filter((n) => n.is_resolved)
    return result.sort(
      (a, b) => new Date(b.note_date).getTime() - new Date(a.note_date).getTime()
    )
  }, [notes, filter])

  const handleResolve = useCallback(
    async (id: string) => {
      try {
        await updateNote({ id, changes: { is_resolved: true } }).unwrap()
        toast.success('Marked as resolved')
      } catch {
        toast.error('Failed to update note')
      }
    },
    [updateNote]
  )

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No health notes"
        description={
          filter === 'all'
            ? 'Add your first health note to start tracking.'
            : `No ${filter} health notes found.`
        }
      />
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      {filtered.map((note) => {
        const borderColor = note.is_urgent
          ? 'border-l-terracotta'
          : note.is_resolved
            ? 'border-l-mist'
            : 'border-l-sage'

        return (
          <motion.div key={note.id} variants={item}>
            <Card
              className={cn('border-l-4 p-5', borderColor)}
              onClick={() => onEdit(note)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <Badge variant={typeBadgeVariant[note.type] ?? 'mist'}>
                      {note.type}
                    </Badge>
                    {note.is_urgent && (
                      <Badge variant="terracotta">Urgent</Badge>
                    )}
                    {note.is_resolved && (
                      <Badge variant="mist">Resolved</Badge>
                    )}
                  </div>

                  <h3 className="font-serif text-lg font-semibold text-ink">
                    {note.title}
                  </h3>

                  {note.detail && (
                    <p className="mt-1 line-clamp-2 text-base text-ink/60">
                      {note.detail}
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-3 text-sm text-clay">
                    <span>{format(parseISO(note.note_date), 'MMM d, yyyy')}</span>
                    {note.author_id && <AuthorByline authorId={note.author_id} />}
                  </div>
                </div>

                {!note.is_resolved && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e?.stopPropagation(); handleResolve(note.id) }}
                  >
                    <Check size={14} aria-hidden="true" />
                    Resolve
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
