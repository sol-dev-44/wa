'use client'

import { useState } from 'react'
import PageShell from '@/components/layout/PageShell'
import JournalFeed from '@/components/journal/JournalFeed'
import JournalEditor from '@/components/journal/JournalEditor'
import JournalAssistant from '@/components/ai/JournalAssistant'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { useAppSelector } from '@/lib/store/store'
import { useGetJournalEntriesQuery } from '@/lib/store/api'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Tables } from '@/types/database'

export default function JournalPage() {
  const router = useRouter()
  const activeChildId = useAppSelector((state) => state.app.activeChildId)
  const { data: entries, isLoading } = useGetJournalEntriesQuery(activeChildId!, {
    skip: !activeChildId,
  })

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Tables<'journal_entries'> | undefined>()

  function handleNewEntry() {
    setEditingEntry(undefined)
    setEditorOpen(true)
  }

  function handleEntryClick(entry: Tables<'journal_entries'>) {
    router.push(`/journal/${entry.id}`)
  }

  function handlePromptSelect(prompt: string) {
    setEditingEntry(undefined)
    setEditorOpen(true)
  }

  return (
    <PageShell title="Journal">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-base text-ink/50">
          Only you and your co-parent can read these
        </p>
        <Button onClick={handleNewEntry}>
          <Plus size={16} aria-hidden="true" />
          New Entry
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Feed column */}
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-xl" count={3} />
            </div>
          ) : (
            <JournalFeed
              entries={entries ?? []}
              onEntryClick={handleEntryClick}
            />
          )}
        </div>

        {/* AI assistant sidebar */}
        <div className="hidden w-[280px] shrink-0 lg:block">
          {activeChildId && (
            <JournalAssistant
              childId={activeChildId}
              onPromptSelect={handlePromptSelect}
            />
          )}
        </div>
      </div>

      <JournalEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        entry={editingEntry}
      />
    </PageShell>
  )
}
