'use client'

import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { Plus, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import PageShell from '@/components/layout/PageShell'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import HealthFeed from '@/components/health/HealthFeed'
import HealthNoteForm from '@/components/health/HealthNoteForm'
import HealthInsights from '@/components/ai/HealthInsights'
import { useAppSelector } from '@/lib/store/store'
import { useGetHealthNotesQuery } from '@/lib/store/api'
import type { Tables } from '@/types/database'

type Filter = 'all' | 'active' | 'resolved'

export default function HealthPage() {
  const activeChildId = useAppSelector((s) => s.app.activeChildId)
  const { data: notes = [], isLoading } = useGetHealthNotesQuery(activeChildId!, {
    skip: !activeChildId,
  })

  const [filter, setFilter] = useState<Filter>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Tables<'health_notes'> | undefined>()

  const today = format(new Date(), 'yyyy-MM-dd')

  const upcoming = useMemo(
    () =>
      notes
        .filter(
          (n) =>
            n.type === 'Appointment' && n.note_date >= today && !n.is_resolved
        )
        .sort((a, b) => a.note_date.localeCompare(b.note_date)),
    [notes, today]
  )

  const filters: { label: string; value: Filter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Resolved', value: 'resolved' },
  ]

  function handleEdit(note: Tables<'health_notes'>) {
    setEditingNote(note)
    setFormOpen(true)
  }

  function handleCloseForm() {
    setFormOpen(false)
    setEditingNote(undefined)
  }

  if (!activeChildId) {
    return (
      <PageShell title="Health">
        <p className="text-base text-ink/60">Select a child to view health notes.</p>
      </PageShell>
    )
  }

  return (
    <PageShell title="Health">
      {/* Header row */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-sand p-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={
                'rounded-md px-3 py-1.5 text-base font-medium transition-colors ' +
                (filter === f.value
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink/50 hover:text-ink')
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} aria-hidden="true" />
          Add Note
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-8">
        {/* Main feed column */}
        <div className="min-w-0 flex-1">
          {/* Upcoming appointments */}
          {upcoming.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="mb-3 font-serif text-xl font-semibold text-ink">
                Upcoming
              </h2>
              <div className="flex flex-col gap-3">
                {upcoming.map((appt) => (
                  <Card
                    key={appt.id}
                    className="flex items-center gap-4 border-l-4 border-l-sage p-4"
                    onClick={() => handleEdit(appt)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/15">
                      <Calendar size={18} className="text-sage-deep" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">{appt.title}</p>
                      <p className="text-base text-ink/60">
                        {format(parseISO(appt.note_date), 'EEE, MMM d, yyyy')}
                      </p>
                    </div>
                    {appt.is_urgent && <Badge variant="terracotta">Urgent</Badge>}
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Main feed */}
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full rounded-xl" count={3} />
            </div>
          ) : (
            <HealthFeed
              notes={notes}
              filter={filter}
              onEdit={handleEdit}
            />
          )}
        </div>

        {/* AI Insights sidebar */}
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <HealthInsights childId={activeChildId} />
        </aside>
      </div>

      {/* Form modal */}
      <HealthNoteForm
        isOpen={formOpen}
        onClose={handleCloseForm}
        note={editingNote}
        childId={activeChildId}
      />
    </PageShell>
  )
}
