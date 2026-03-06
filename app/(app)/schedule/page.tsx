'use client'

import { useState, useMemo } from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  parseISO,
} from 'date-fns'
import { ChevronLeft, ChevronRight, ArrowLeftRight } from 'lucide-react'
import { motion } from 'framer-motion'
import PageShell from '@/components/layout/PageShell'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import WeekGrid from '@/components/schedule/WeekGrid'
import HandoffCard from '@/components/schedule/HandoffCard'
import { useAppSelector } from '@/lib/store/store'
import { useGetScheduleBlocksQuery, useGetCoParentsQuery } from '@/lib/store/api'
import type { Tables } from '@/types/database'

export default function SchedulePage() {
  const activeChildId = useAppSelector((s) => s.app.activeChildId)

  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [handoffOpen, setHandoffOpen] = useState(false)

  const startDate = format(currentWeekStart, 'yyyy-MM-dd')
  const endDate = format(weekEnd, 'yyyy-MM-dd')

  const { data: blocks = [], isLoading: blocksLoading } = useGetScheduleBlocksQuery(
    { childId: activeChildId!, startDate, endDate },
    { skip: !activeChildId }
  )

  const { data: coParents = [] } = useGetCoParentsQuery(activeChildId!, {
    skip: !activeChildId,
  })

  const nextHandoff = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return blocks
      .filter((b) => b.is_handoff && b.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0]
  }, [blocks])

  const selectedBlock = useMemo(
    () => (selectedDate ? blocks.find((b) => b.date === selectedDate) : undefined),
    [blocks, selectedDate]
  )

  function handleDayClick(dateStr: string) {
    setSelectedDate(dateStr)
    setHandoffOpen(true)
  }

  function handleCloseHandoff() {
    setHandoffOpen(false)
    setSelectedDate(null)
  }

  if (!activeChildId) {
    return (
      <PageShell title="Schedule">
        <p className="text-base text-ink/60">Select a child to view the schedule.</p>
      </PageShell>
    )
  }

  return (
    <PageShell title="Schedule">
      {/* Week navigation */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentWeekStart((w) => subWeeks(w, 1))}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </Button>

          <h2 className="font-serif text-xl font-semibold text-ink">
            {format(currentWeekStart, 'MMM d')} &ndash;{' '}
            {format(weekEnd, 'MMM d, yyyy')}
          </h2>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentWeekStart((w) => addWeeks(w, 1))}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
          }
        >
          Today
        </Button>
      </div>

      {/* Week grid */}
      {blocksLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <WeekGrid
          blocks={blocks}
          coParents={coParents}
          weekStart={currentWeekStart}
          onDayClick={handleDayClick}
        />
      )}

      {/* Next handoff summary */}
      {nextHandoff && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Card className="flex items-center gap-4 border-l-4 border-l-clay p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-clay/15">
              <ArrowLeftRight size={18} className="text-clay" aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-medium text-ink">Next handoff</p>
              <p className="text-base text-ink/60">
                {format(parseISO(nextHandoff.date), 'EEEE, MMM d')}
                {nextHandoff.handoff_time && ` at ${nextHandoff.handoff_time}`}
              </p>
              {nextHandoff.handoff_note && (
                <p className="mt-1 text-sm text-ink/50">{nextHandoff.handoff_note}</p>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Handoff edit modal */}
      <HandoffCard
        isOpen={handoffOpen}
        onClose={handleCloseHandoff}
        date={selectedDate ?? ''}
        existingBlock={selectedBlock}
        coParents={coParents}
        childId={activeChildId}
      />
    </PageShell>
  )
}
