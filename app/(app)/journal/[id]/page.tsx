'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, Edit3, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import PageShell from '@/components/layout/PageShell'
import JournalEditor from '@/components/journal/JournalEditor'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import { useAppSelector } from '@/lib/store/store'
import {
  useGetJournalEntriesQuery,
  useDeleteJournalEntryMutation,
  useGetCoParentsQuery,
} from '@/lib/store/api'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'

export default function JournalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const activeChildId = useAppSelector((state) => state.app.activeChildId)

  const { data: entries, isLoading } = useGetJournalEntriesQuery(activeChildId!, {
    skip: !activeChildId,
  })
  const { data: coParents } = useGetCoParentsQuery(activeChildId!, {
    skip: !activeChildId,
  })
  const [deleteEntry, { isLoading: isDeleting }] = useDeleteJournalEntryMutation()
  const [editorOpen, setEditorOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) setCurrentUserId(data.user.id)
    }
    getUser()
  }, [])

  const entry = entries?.find((e) => e.id === id)

  const authorParent = coParents?.find((cp) => cp.user_id === entry?.author_id)
  const authorName = authorParent?.label ?? 'Parent'
  const isAuthor = currentUserId === entry?.author_id

  async function handleDelete() {
    if (!entry) return
    if (!window.confirm('Delete this journal entry? This cannot be undone.')) return

    try {
      await deleteEntry(entry.id).unwrap()
      toast.success('Entry deleted')
      router.push('/journal')
    } catch {
      toast.error('Failed to delete entry')
    }
  }

  if (isLoading) {
    return (
      <PageShell title="Journal">
        <Skeleton className="h-6 w-48 rounded" />
        <Skeleton className="mt-4 h-64 w-full rounded-xl" />
      </PageShell>
    )
  }

  if (!entry) {
    return (
      <PageShell title="Journal">
        <div className="py-16 text-center">
          <p className="text-ink/50">Entry not found</p>
          <Button variant="ghost" onClick={() => router.push('/journal')} className="mt-4">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Journal
          </Button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="Journal">
      {/* Back button */}
      <button
        onClick={() => router.push('/journal')}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-clay transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to Journal
      </button>

      <Card className="max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={authorName} size="sm" color={authorParent?.color ?? 'sage'} />
            <div>
              <p className="text-sm font-medium text-ink">{authorName}</p>
              <p className="text-xs text-ink/50">
                {format(parseISO(entry.created_at), 'MMMM d, yyyy · h:mm a')}
              </p>
            </div>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditorOpen(true)}>
                <Edit3 size={14} aria-hidden="true" />
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete} loading={isDeleting}>
                <Trash2 size={14} aria-hidden="true" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Mood + Title */}
        <div className="mb-4 flex items-center gap-3">
          {entry.mood && <span className="text-2xl">{entry.mood}</span>}
          <h2 className="font-serif text-2xl font-semibold text-ink">{entry.title}</h2>
        </div>

        {/* Body */}
        <div className="prose prose-ink max-w-none whitespace-pre-wrap text-ink/80">
          {entry.body}
        </div>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-mist pt-4">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="sage">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Updated indicator */}
        {entry.updated_at !== entry.created_at && (
          <p className="mt-4 text-xs text-ink/40">
            Edited {format(parseISO(entry.updated_at), 'MMM d, yyyy')}
          </p>
        )}
      </Card>

      <JournalEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        entry={entry}
      />
    </PageShell>
  )
}
